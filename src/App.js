import React, { Component } from 'react';
//import logo from ‘./logo.svg’;
import './App.css';
import web3 from './web3';
import ipfs from './ipfs';
import storehash from './storehash';


class App extends Component {
 
  state = {
    ipfsHash:null,
    buffer:'',
    ethAddress:'',
    blockNumber:'',
    transactionHash:'',
    gasUsed:'',
    txReceipt: '',   
    ipfs_img:null
  };

  captureFile =(event) => {
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]
    let reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => this.convertToBuffer(reader)    
  };

  convertToBuffer = async(reader) => {
    //file is converted to a buffer for upload to IPFS
    const buffer = await Buffer.from(reader.result);

    //set this buffer -using es6 syntax
    this.setState({buffer});
  };

  onClick = async () => {
    try{
        this.setState({blockNumber:"waiting.."});
        this.setState({gasUsed:"waiting..."});

        //get Transaction Receipt in console on click
        //See: https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt
        await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt)=>{
          console.log(err,txReceipt);
          this.setState({txReceipt});
        }); //await for getTransactionReceipt

        await this.setState({blockNumber: this.state.txReceipt.blockNumber});
        await this.setState({gasUsed: this.state.txReceipt.gasUsed});    
    } //try
    catch(error){
        console.log(error);
    } //catch
  } //onClick

  onSubmit = async (event) => {
    event.preventDefault();
    //bring in user's metamask account address
    const accounts = await web3.eth.getAccounts();
    
    console.log('Sending from Metamask account: ' + accounts[0]);

    //obtain contract address from storehash.js
    const ethAddress= await storehash.options.address;
    this.setState({ethAddress});

    //save document to IPFS,return its hash#, and set hash# to state
    //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add 
    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
      console.log(err,ipfsHash);
      //setState by setting ipfsHash to ipfsHash[0].hash 
      this.setState({ ipfsHash:ipfsHash[0].hash });
      const ipfs_img ="https://gateway.ipfs.io/ipfs/"+ipfsHash[0].hash;
      console.log(err,ipfs_img);
      this.setState({ipfs_img});
      // ipfs_img = image('http://www.ghttps://gateway.ipfs.io/ipfs/QmRrwgD7JYq3CTZUrJ6WPKKxkwPCuKY5CL6wC8DyF6uDSfoogle.com/image.png');
      
      
      // call Ethereum contract method "setHash" and .send IPFS hash to etheruem contract 
      //return the transaction hash from the ethereum contract
      //see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send
      storehash.methods.setHash(this.state.ipfsHash).send({
        from: accounts[0] 
      }, (error, transactionHash) => {
        console.log(transactionHash);
        this.setState({transactionHash});
      }); //storehash 
    }) //await ipfs.add 
  }; //onSubmit


  render() {
        
    return (
      <div className="App">
        <header className="App-header">
          <h1> Ethereum and IPFS with Create React App</h1>
        </header>
        
        <hr/>
      <grid>
        <h3> Choose file to send to IPFS </h3>
        <div class="div_center">
          <form class="form-group" onSubmit={this.onSubmit} >
            <input type = "file" onChange = {this.captureFile} />
            {/* <div class=" col-md-2 col-x2-1">  btn-block*/}
              <button class="button_center btn btn-outline-primary cursor-pointer" type="submit"> Send it</button>
            {/* </div> */}
          </form>
        </div>
        <br></br>
        <hr/>
          <div class="div_center">
            <div class="col-md-3 col-x2-1">
              <button type="button" class="button2 btn-block btn btn-outline-primary nofocus cursor-pointer" onClick = {this.onClick}> Get Transaction Receipt </button>
            </div>
          <table class="table table-striped table-hover" bordered responsive>
              <thead>
                <tr>
                  <th scope="col" class="col-md-3" >Tx Receipt Category</th>
                  <th scope="col" class="col-md-3">Values</th>
                </tr>
              </thead>
              
              <tbody>
                <tr>
                  <th scope="row">IPFS Hash # stored on Eth Contract: </th>
                  <td>{this.state.ipfsHash}</td>
                </tr>
                <tr>
                  <th scope="row">Ethereum Contract Address: </th>
                  <td>{this.state.ethAddress}</td>
                </tr>
                <tr>
                  <th scope="row">Tx Hash # : </th>
                  <td>{this.state.transactionHash}</td>
                </tr>
                <tr>
                  <th scope="row">Block Number # : </th>
                  <td>{this.state.blockNumber}</td>
                </tr>
                <tr>
                  <th scope="row">Gas Used : </th>
                  <td>{this.state.gasUsed}</td>
                </tr>
              
              </tbody>
          </table>
          <h3>IPFS image</h3>
          <iframe src={this.state.ipfs_img} alt="ipfs" width="1000" height="500" title="myFrame"></iframe>
          <br></br>
          </div>
      </grid>
    </div>
    );
  } //render
} //App
export default App;
