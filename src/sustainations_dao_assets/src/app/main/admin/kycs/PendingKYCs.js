import { useState, useLayoutEffect, useEffect } from "react";
import { useSelector } from 'react-redux';
import axios from "axios";
import { selectUser } from 'app/store/userSlice';
import FuseLoading from '@fuse/core/FuseLoading';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import FusePageCarded from '@fuse/core/FusePageCarded';
import KYCsHeader from './list/KYCsHeader';
import KYCTable from './list/KYCTable';
import urlAPI from 'api/urlAPI';

const PendingKYCs = () => {
  const user = useSelector(selectUser);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [kycs, setKycs] = useState([]);

  useEffect(() => {
    setLoading(true);
    axios.get(`${urlAPI}/get/pending`).then((response) => {
      setKycs(response.data);
    });
    setLoading(false);
  },[user])

  console.log(kycs)
  useLayoutEffect(() => {
    function getFilteredArray() {
      if (searchText.length === 0) {
        return kycs;
      }
      return _.filter(kycs, (item) => {
        return item[1].name.toLowerCase().includes(searchText.toLowerCase());
      });
    }

    if (kycs) {
      setFilteredData(getFilteredArray());
    }
  }, [kycs, searchText]);

  function handleSearchText(event) {
    setSearchText(event.target.value);
  }

  if (loading) {
    return <FuseLoading />;
  }

  return (
    <FusePageCarded
      header={<KYCsHeader handleSearchText={handleSearchText} filterdType={"Pending KYCs"}/>}
      content={<KYCTable kycs={filteredData} searchText={searchText} filterdType={"Pending KYCs"}/>}
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
}

export default PendingKYCs;
