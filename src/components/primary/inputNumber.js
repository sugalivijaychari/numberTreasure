import React, { useState, useEffect } from 'react';
import { abi, contractAddress } from './contractData';
import Web3 from 'web3';
import { Button, Form, Table } from 'react-bootstrap';
import classNames from 'classnames';

const InputNumber = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [textInput, setTextInput] = useState("");
  const [total, setTotal] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [web3, setWeb3] = useState(null);
  const [isWeb3Set, SetIsWeb3] = useState(false);
  const [isStateFetched, SetIsStateFetched] = useState(false);

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

  function handleOptionChange(e) {
    setSelectedOption(e.target.value);
  }

  function handleTextInputChange(e) {
    setTextInput(e.target.value);
  }

  async function handleButtonClick() {
    setLoading(true);
    setError(null);
    try {
      /* convert the input to fraction */
      const fraction = convertDecimalToFraction(textInput);

      /* call the function to add number */
      const contract = new web3.eth.Contract(abi, contractAddress)
      const result = await contract.methods.inputNumber(fraction).send({ from: account });
      
      /* get total */
      const totalSum = await contract.methods.getTotal().call();
      setTotal(totalSum.numerator / totalSum.denominator);

      /* get users count */
      const usersCount = await contract.methods.getUsersCount().call();
      setUserCount(usersCount);
    } catch (error) {
      setError(`Failed to query contract function: ${error}`);
    }
    setLoading(false);
  }

  function convertDecimalToFraction(decimal) {
    // Check if decimal is negative
    const isNegative = decimal < 0;
    
    // Convert decimal to absolute value
    decimal = Math.abs(decimal);

    // Initialize numerator and denominator
    let numerator = 1;
    let denominator = 1;

    // Find greatest common divisor using Euclid's algorithm
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    let decimalPrecision = decimal.toString().split('.')[1];
    if (decimalPrecision) {
      denominator = Math.pow(10, decimalPrecision.length);
      numerator = decimal * denominator;
    } else {
      numerator = decimal;
    }
    const divisor = gcd(numerator, denominator);

    // Simplify fraction
    numerator /= divisor;
    denominator /= divisor;

    // Add negative sign if necessary
    if (isNegative) {
      numerator = -numerator;
    }
    return { numerator, denominator };
  }

  return (
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
      <br />
      { isWeb3Set &&
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '1rem 0',
          }}
        >
          <Form className="w-100">
            <Form.Group controlId="formSelect">
              <Form.Label>Select type:</Form.Label>
              <Form.Control as="select" value={selectedOption} onChange={handleOptionChange}>
                <option value="">select</option>
                <option value="Decimal">Decimal</option>
              </Form.Control>
            </Form.Group>
            <br />
            <Form.Group controlId="formNumberInput">
              <Form.Label>Enter number:</Form.Label>
              <Form.Control type="text" value={textInput} onChange={handleTextInputChange} />
            </Form.Group>

            <Button className={classNames('mt-3', { 'disabled': !selectedOption || !textInput })} onClick={handleButtonClick}>
              Add Number
            </Button>
          </Form>
        </div>
      }
    </div>
  );
};

export default InputNumber;
