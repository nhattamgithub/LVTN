import Array "mo:base/Array";
import AsyncSource "mo:uuid/async/SourceV4";
import Debug "mo:base/Debug";
import Float "mo:base/Float";
import Error "mo:base/Error";
import Int "mo:base/Int";
import Int64 "mo:base/Int64";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Nat64 "mo:base/Nat64";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import TrieMap "mo:base/TrieMap";
import UUID "mo:uuid/UUID";

import Account "./plugins/Account";
import Moment "./plugins/Moment";
import Types "types";
import State "state";
import Ledger "./plugins/Ledger";
import RS "./models/RefillStation";

shared({caller = owner}) actor class SustainationsDAO(ledgerId : ?Text) = this {
  stable var transferFee : Nat64 = 10_000;
  stable var createProposalFee : Nat64 = 20_000;
  stable var voteFee : Nat64 = 20_000;
  stable var treasuryContribution : Float = 0.03;

  var state : State.State = State.empty();

  private stable var profiles : [(Principal, Types.Profile)] = [];
  private stable var transactions : [(Text, Types.TxRecord)] = [];
  private stable var userAgreements : [(Principal, Types.UserAgreement)] = [];
  private stable var kycs : [(Principal, Types.KYC)] = [];


  system func preupgrade() {
    Debug.print("Begin preupgrade");
    profiles := Iter.toArray(state.profiles.entries());
    transactions := Iter.toArray(state.transactions.entries());
    userAgreements := Iter.toArray(state.userAgreements.entries());
    kycs := Iter.toArray(state.kycs.entries());
    Debug.print("End preupgrade");
  };

  system func postupgrade() {
    Debug.print("Begin postupgrade");
    for ((k, v) in Iter.fromArray(profiles)) {
      state.profiles.put(k, v);
    };
    for ((k, v) in Iter.fromArray(transactions)) {
      state.transactions.put(k, v);
    };
    for ((k, v) in Iter.fromArray(userAgreements)) {
      state.userAgreements.put(k, v);
    };
    for ((k, v) in Iter.fromArray(kycs)) {
      state.kycs.put(k, v);
    };
    Debug.print("End postupgrade");
  };

  type Response<Ok> = Result.Result<Ok, Types.Error>;
  private let ledger : Ledger.Interface = actor(Option.get(ledgerId, "ryjl3-tyaaa-aaaaa-aaaba-cai"));

  private func createUUID() : async Text {
    var ae = AsyncSource.Source();
    let id = await ae.new();
    UUID.toText(id);
  };

  public shared({ caller }) func getBalance() : async Ledger.ICP {
    let accountId = Account.accountIdentifier(
      Principal.fromActor(this), Account.principalToSubaccount(caller)
    );
    await ledger.account_balance({ account = accountId });
  };

  public func getSystemBalance() : async Ledger.ICP {
    let accountId = Account.accountIdentifier(Principal.fromActor(this), Account.defaultSubaccount());
    await ledger.account_balance({ account = accountId });
  };

  public query func getSystemAddress() : async Blob {
    Account.accountIdentifier(Principal.fromActor(this), Account.defaultSubaccount())
  };

  public shared({ caller }) func submitAgreement() : async Response<Text> {
    if (Principal.toText(caller) == "2vxsx-fae") {
      return #err(#NotAuthorized);//isNotAuthorized
    };

    let agreement = state.userAgreements.get(caller);
    switch (agreement) {
      case null{
        let payload = {
          uid = Principal.toText(caller);
          timestamp = Time.now();
        };
        let result = state.userAgreements.put(caller, payload);
        let receipt = await rewardUserAgreement(caller);
        let profile = state.profiles.put(caller, {
          username = null;
          avatar = null;
          address = null;
          phone = null;
          role = #user;
        });
        #ok("Success!");
      };
      case (? _v) {
        #ok("Success!");
      };
    }
  };

  type UserAgreementSerializer = {
    address : Text;
    timestamp : Time.Time;
  };
  public query func getUserAgreement(uid : Text) : async Response<UserAgreementSerializer> {
    let caller = Principal.fromText(uid);
    switch (state.userAgreements.get(caller)) {
      case null { #err(#NotFound) };
      case (? agreement) {
        let response = {
          address = Account.toText(
            Account.accountIdentifier(Principal.fromActor(this), Account.principalToSubaccount(caller))
          );
          timestamp = agreement.timestamp;
        };
        #ok(response);
      };
    };
  };

  // Withdraw ICP from user's subaccount
  public shared({ caller }) func withdraw(amount: Nat64, address: Principal) : async Response<Nat64> {
    if (Principal.toText(caller) == "2vxsx-fae") {
      return #err(#NotAuthorized);//isNotAuthorized
    };

    let sourceAccount = Account.accountIdentifier(Principal.fromActor(this), Account.principalToSubaccount(caller));
    // Check ledger for value
    let balance = await ledger.account_balance({ account = sourceAccount });
    let accountId = Account.accountIdentifier(address, Account.defaultSubaccount());

    // Transfer amount back to user
    let receipt = if (balance.e8s >= amount + transferFee) {
      await ledger.transfer({
        memo: Nat64    = 0;
        from_subaccount = ?Account.principalToSubaccount(caller);
        to = accountId;
        amount = { e8s = amount };
        fee = { e8s = transferFee };
        created_at_time = ?{ timestamp_nanos = Nat64.fromNat(Int.abs(Time.now())) };
      });
    } else {
      return #err(#BalanceLow);
    };

    switch receipt {
      case (#Err e) {
        Debug.print(debug_show e);
        return #err(#TransferFailure);
      };
      case _ {};
    };
    #ok(amount)
  };

  type UserInfo = {
    depositAddress : Text;
    balance : Nat64;
    agreement : Bool;
    profile : ?Types.Profile;
    brandId : ?Text;
    brandRole : ?RS.ManagerRole;
  };
  public shared({ caller }) func getUserInfo() : async Response<UserInfo> {
    if (Principal.toText(caller) == "2vxsx-fae") {
      return #err(#NotAuthorized);//isNotAuthorized
    };
    let accountId = Account.accountIdentifier(Principal.fromActor(this), Account.principalToSubaccount(caller));
    let balance = await ledger.account_balance({ account = accountId });
    let agreement = switch (state.userAgreements.get(caller)) {
      case (null) { false };
      case _ { true };
    };
    let profile = state.profiles.get(caller);
    var brandId : ?Text = null;
    var brandRole : ?RS.ManagerRole = null;
    switch (state.refillBrand.managers.get(caller)) {
      case (null) {};
      case (?manager) { brandId := ?manager.brandId; brandRole := ?manager.role; };
    };
    let userInfo = {
      depositAddress = Account.toText(
        Account.accountIdentifier(Principal.fromActor(this), Account.principalToSubaccount(caller))
      );
      balance = balance.e8s;
      agreement;
      profile;
      brandId;
      brandRole;
    };
    #ok(userInfo);
  };

  public shared({ caller }) func updateUserProfile(
    username : ?Text,
    phone : ?Text,
    address : ?Text,
    avatar : ?Text
  ) : async Response<Types.Profile> {
    if (Principal.toText(caller) == "2vxsx-fae") {
      return #err(#NotAuthorized);//isNotAuthorized
    };
    switch (state.profiles.get(caller)) {
      case null {
        let payload : Types.Profile = {
          username;
          phone;
          address;
          avatar;
          role = #user;
        };
        let profile = state.profiles.put(caller, payload);
        #ok(payload);
      };
      case (?profile) {
        let payload : Types.Profile = {
          username;
          phone;
          address;
          avatar;
          role = profile.role;
        };
        let updated = state.profiles.replace(caller, payload);
        #ok(payload);
      };
    };
  };

  // Transfer ICP from user's subaccount to system subaccount
  private func deposit(amount : Nat64, caller : Principal) : async Response<Nat64> {
    // Calculate target subaccount
    let accountId = Account.accountIdentifier(Principal.fromActor(this), Account.principalToSubaccount(caller));
    // Check ledger for value
    let balance = await ledger.account_balance({ account = accountId });
    // Transfer to default subaccount
    let receipt = if (balance.e8s >= amount + transferFee) {
      await ledger.transfer({
        memo: Nat64    = 0;
        from_subaccount = ?Account.principalToSubaccount(caller);
        to = Account.accountIdentifier(Principal.fromActor(this), Account.defaultSubaccount());
        amount = { e8s = amount };
        fee = { e8s = transferFee };
        created_at_time = ?{ timestamp_nanos = Nat64.fromNat(Int.abs(Time.now())) };
      })
    } else {
      return #err(#BalanceLow);
    };

    switch receipt {
      case ( #Err _) {
        #err(#TransferFailure);
      };
      case (#Ok(bIndex)) {
        #ok(bIndex);
      };
    };
  };

  private func recordTransaction(
    caller : Principal,
    amount : Nat64,
    fromPrincipal : Principal, toPrincipal : Principal,
    refType : Types.Operation, refId : ?Text,
    blockIndex : Nat64
  ) : async () {
    let uuid : Text = await createUUID();
    let transaction : Types.TxRecord = {
      uuid;
      caller;
      refType;
      refId;
      blockIndex;
      fromPrincipal;
      toPrincipal;
      amount;
      fee = transferFee;
      timestamp = Time.now();
    };
    state.transactions.put(uuid, transaction);
  };

  func refund(amount : Nat64, toPrincipal : Principal) : async Ledger.TransferResult {
    let accountId = Account.accountIdentifier(Principal.fromActor(this), Account.principalToSubaccount(toPrincipal));
    await ledger.transfer({
      memo: Nat64    = 0;
      from_subaccount = ?Account.defaultSubaccount();
      to = accountId;
      amount = { e8s = amount };
      fee = { e8s = transferFee };
      created_at_time = ?{ timestamp_nanos = Nat64.fromNat(Int.abs(Time.now())) };
    })
  };

  func rewardUserAgreement(uid : Principal) : async () {
    let reward = createProposalFee + transferFee + transferFee;
    let receipt = await refund(reward, uid);
    switch (receipt) {
      case (#Err(error)) {
        Debug.print(debug_show error);
      };
      case (#Ok(bIndex)) {
        // record transaction
        await recordTransaction(
          Principal.fromActor(this), reward,
          Principal.fromActor(this), uid,
          #awardUserAgreement, ?Principal.toText(uid), bIndex
        );
      };
    };
  };

  public query({ caller }) func getTransactions() : async Response<[Types.TxRecord]> {
    if (Principal.toText(caller) == "2vxsx-fae") {
      return #err(#NotAuthorized);//isNotAuthorized
    };
    #ok(Iter.toArray(state.transactions.vals()));
  };

  //verify admin
  private func isAdmin(caller : Principal) : Bool {
    if (Principal.equal(caller, owner)) return true;
    switch (state.profiles.get(caller)) {
      case null return false;
      case (?profile) return profile.role == #admin;
    };
  };

  /* === Admin functions === */
  // admin set user's role
  public shared({ caller })func setRole(principalText : Text, role : Types.Role) : async Response<Text>{
    if(Principal.toText(caller) == "2vxsx-fae") {
      return #err(#NotAuthorized);// isNotAuthorized
    };
    if(isAdmin(caller)) {
      let principal = Principal.fromText(principalText);
      switch (state.profiles.get(principal)) {
        case (null) {
          let profile : Types.Profile = {
            username = null;
            avatar = null;
            address = null;
            phone = null;
            role;
          };
          state.profiles.put(principal, profile);
        };
        case (?profile) {
          let newProfile = state.profiles.replace(principal, {
            username = profile.username;
            avatar = profile.avatar;
            address = profile.address;
            phone = profile.phone;
            role;
          });
        };
      };
      #ok("Success");
    } else {
      #err(#AdminRoleRequired);
    };
  };

  // KYC
  public shared({caller}) func createKYC(kyc : Types.KYCUpdate) : async Response<Text> {
    if(Principal.toText(caller) == "2vxsx-fae") {
      throw Error.reject("NotAuthorized");  //isNotAuthorized
    };
    switch (state.kycs.get(caller)) {
      case (? currentKYC) {
        if(currentKYC.status == ?"rejected") {
          let updatedKYC = state.kycs.replace(caller, {
            userId = caller;
            username = kyc.username;
            address = kyc.address;
            phone = kyc.phone;
            image = kyc.image;
            status = ?"waiting";
            comments = currentKYC.comments;
            approver = currentKYC.approver;
            createdAt = currentKYC.createdAt;
            updatedAt = ?Time.now();
          });
        };
        if(currentKYC.status == ?"new") {
          let updatedKYC = state.kycs.replace(caller, {
            userId = caller;
            username = kyc.username;
            address = kyc.address;
            phone = kyc.phone;
            image = kyc.image;
            status = ?"waiting";
            comments = currentKYC.comments;
            approver = currentKYC.approver;
            createdAt = currentKYC.createdAt;
            updatedAt = ?Time.now();
          });
          #ok(("success"));
        }
        else { #err(#AlreadyExisting) };
      };
      case (null) {
        let createdKYC = state.kycs.put(caller, {
          userId = caller;
          username = kyc.username;
          address = kyc.address;
          phone = kyc.phone;
          image = kyc.image;
          status : ?Text = Option.get(null, ?"new");
          comments : ?Text = Option.get(null, ?"");
          approver : ?Principal = null;
          createdAt : ?Int = Option.get(null, ?Time.now());
          updatedAt : ?Int = Option.get(null, ?Time.now());
        });
        #ok(("success"));
      };
    };
  };

  public shared query({caller}) func getKYC() : async Response<(Types.KYC)>{
    if(Principal.toText(caller) == "2vxsx-fae") {
      throw Error.reject("NotAuthorized");  //isNotAuthorized
    };
    let kyc = state.kycs.get(caller);
    return Result.fromOption(kyc, #NotFound);
  };

  public shared query({caller}) func listKYCs() : async Response<[(Principal, Types.KYC)]>{
    var list : [(Principal, Types.KYC)] = [];
    if(Principal.toText(caller) == "2vxsx-fae") {
      throw Error.reject("NotAuthorized");  //isNotAuthorized
    };
    for((K, V) in state.kycs.entries()) {
      list := Array.append<(Principal, Types.KYC)>(list, [(K, V)]);
    };
    #ok((list));
  };

  func isKYCedUser(userId : Principal) : async Bool{
    let kyc = state.kycs.get(userId);
    switch (kyc) {
      case null{
        return false;
      };
      case (? currentKYC) {
        if(currentKYC.status == ?"approved") {
          return true;
        } else {
          return false;
        }
      };
    };
  };

  public shared query({caller}) func getKYCStatus() : async Response<(?Text, ?Text)>{
    if(Principal.toText(caller) == "2vxsx-fae") {
      throw Error.reject("NotAuthorized");  //isNotAuthorized
    };
    switch (state.kycs.get(caller)) {
      case null{
        #err(#NotFound);
      };
      case (? currentKYC) {
        let kycStatus = currentKYC.status;
        #ok(kycStatus, currentKYC.comments);
      };
    };
  };

  public shared({caller}) func updateKYC(kyc : Types.KYC) : async Response<Text>{
    if(Principal.toText(caller) == "2vxsx-fae") {
      throw Error.reject("NotAuthorized");  //isNotAuthorized
    };
    switch (state.kycs.get(caller)) {
      case null{
        #err(#NotFound);
      };
      case (? currentKYC) {
        let updatedKYC = state.kycs.replace(caller, {
          userId = caller;
          username = currentKYC.username;
          address = currentKYC.address;
          phone = currentKYC.phone;
          image = currentKYC.image;
          status = ?"waiting";
          comments = currentKYC.comments;
          approver : ?Principal = null;
          createdAt = currentKYC.createdAt;
          updatedAt = ?Time.now();
        });
        #ok("Success");
      };
    };
  };

  public shared({caller}) func approveKYC(kycStatus : Text, comments : Text, userId : Text) : async Response<Text>{
    if(Principal.toText(caller) == "2vxsx-fae") {
      throw Error.reject("NotAuthorized");  //isNotAuthorized
    };
    switch (state.kycs.get((Principal.fromText(userId)))) {
      case null{
        #err(#NotFound);
      };
      case (?currentKYC) {
        if(currentKYC.status == ?"approved") {
          #ok("Already approved");
        } else{
          let kyc_updated = state.kycs.replace(Principal.fromText(userId), {
            userId = caller;
            username = currentKYC.username;
            address = currentKYC.address;
            phone = currentKYC.phone;
            image = currentKYC.image;
            status = ?kycStatus;
            comments = currentKYC.comments;
            approver : ?Principal= ?caller;
            createdAt = currentKYC.createdAt;
            updatedAt = ?Time.now();
          });
          #ok("Success");
        };
      };
    };
  };

  public shared({caller}) func deleteAllKYCs() : async Response<Text>{
    if(Principal.toText(caller) == "2vxsx-fae") {
      throw Error.reject("NotAuthorized");  //isNotAuthorized
    };

    for((K,V) in state.kycs.entries()) {
      let deleted = state.kycs.delete(K);
    };
    #ok("Success");
  };
}