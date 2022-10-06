import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import List "mo:base/List";
import RS "models/RefillStation";

module {
  // User Profile
  public type Role = {
    #user;
    #admin;
  };
  public type Profile = {
    username : ?Text;
    address : ?Text;
    avatar : ?Text;
    phone : ?Text;
    role : Role;
  };
  // User Agreement
  public type UserAgreement = {
    timestamp : Time.Time;
  };

  // Transaction
  public type Operation = {
    #withdraw;
    #createProposal;
    #returnProposalFee;
    #vote;
    #returnVoteFee;
    #executeApprovedProposal;
    #awardUserAgreement;
    #rewardTop;
    #collectTreasuryContribution;
    #payQuest;
  };

  public type TxRecord = {
    uuid : Text;
    caller : Principal;
    refType : Operation; // operation type
    refId : ?Text;
    blockIndex : Nat64; // transaction index
    fromPrincipal : Principal;
    toPrincipal : Principal;
    amount : Nat64;
    fee : Nat64;
    timestamp : Time.Time;
  };

  // KYC
  public type KYC = {
    userId : Principal;
    username : Text;
    address : Text;
    phone : Text;
    image : Text;
    status : Text;
    comments : ?Text;
    approver : Text;
    createdAt : ?Int;
    updatedAt : ?Int;
  };

  public type KYCUpdate = {
    username : Text;
    address : Text;
    phone : Text;
    image : Text;
    approver : Text;
  };

  // Error codes
  public type Error = {
    #BalanceLow;
    #TransferFailure;
    #NotFound;
    #AlreadyExisting;
    #NotAuthorized;
    #SomethingWrong;
    #ProposalIsNotOpened;
    #AlreadyVoted;
    #AdminRoleRequired;
    #OwnerRoleRequired;
    #StationNotFound;
    #InvalidData;
  };

  // Refill Stations
  public type Currency = RS.Currency;
  public type RefillBrand = RS.Brand;
  public type RBManager = RS.Manager;
  public type RBStation = RS.Station;
  public type RBCategory = RS.Category;
  public type RBTag = RS.Tag;
  public type RBProductUnit = RS.ProductUnit;
  public type RBProduct = RS.Product;
  public type RBOrder = RS.Order;
};