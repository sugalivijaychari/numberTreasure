import React, { useState, useEffect } from "react";
import { abi, contractAddress } from './contractData';
import Web3 from 'web3';
import { Button, Form, Table } from 'react-bootstrap';
import classNames from 'classnames';

const ViewData = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [isWeb3Set, SetIsWeb3] = useState(false);
  const [isStateFetched, SetIsStateFetched] = useState(false);
  const [total, setTotal] = useState(0);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    loadWeb3();
  }, []);

  useEffect(() => {
    if (isWeb3Set) {
      getContractState();
    }
  }, [isWeb3Set]); 

  const loadWeb3 = async function(){
    setLoading(true);
    setError(null);
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        setWeb3(web3);
        SetIsWeb3(true)
      } catch (error) {
        setError(error.message);
      }
    } else {
      setError('MetaMask is not installed');
    }
    setLoading(false)
  }

  const getContractState = async function(){
    setLoading(true);
    setError(null);
    try {
      /* get total */
      const contract = new web3.eth.Contract(abi, contractAddress);
      const totalSum = await contract.methods.getTotal().call();
      setTotal(totalSum.numerator/totalSum.denominator);

      /* get users count */
      const usersCount = await contract.methods.getUsersCount().call();
      setUserCount(usersCount);
      SetIsStateFetched(true);
    } catch (error) {
      setError(`Failed to query contract function: ${error}`);
    }
    setLoading(false)
  } 

  return(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem 0',
      }}
    >
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      { isStateFetched &&
        <Table bordered hover striped className="my-4">
          <thead>
            <tr>
              <th colSpan="2" className="text-center bg-light font-weight-bold fs-5 p-3">Contract State Data</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="bg-light font-weight-bold text-right p-2 border">{`Total Sum:`}</td>
              <td className="p-2 border"><strong>{total}</strong></td>
            </tr>
            <tr>
              <td className="bg-light font-weight-bold text-right p-2 border">{`Users count:`}</td>
              <td className="p-2 border"><strong>{userCount}</strong></td>
            </tr>
          </tbody>
        </Table>
      }
    </div>
  );
}

export default ViewData;
