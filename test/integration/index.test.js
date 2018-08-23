const chai = require('chai');
const expect = chai.expect;
const axios = require('axios');
const Web3 = require('web3');
const Datum = require('../../lib/datum');
const datum = new Datum();

/**
 * Constants
 */
const PASSWORD = 'datumpass';
const STORAGE_URL = 'https://node-eu-west.datum.org/storage';
const NETWORK_URL = 'https://node-eu-west.datum.org/api';
const FAUCET_URL = 'https://faucet.megatron.datum.org/v1/faucet/dat/';
const DEPOSIT_DAT = 5;
const DATA_1 = { day: 'Monday' };
const DATA_2 = { day: 'Tuesday' };
const KEYNAME = 'WEEKDAYS';

/**
 * Datum SDK
 */
describe('DATUM SDK', () => {
  let identity;
  let dataHash_1;
  let dataHash_2;

  /**
   * Getting Started
   */
  describe('Getting Started', () => {
    /**
     * Create identity
     */
    it ('should create identity', async () => {
      try {
        identity = await Datum.createIdentity(PASSWORD);
        expect(identity).to.have.property('seed');
        expect(identity).to.have.property('keystore');
      } catch (error) {
        expect(error).to.be.null;
      }
    });

    /**
     * Initialize
     */
    it('should initialize', async () => {
      try {
        datum.initialize({
          identity: [identity.keystore],
          storage: STORAGE_URL,
          network: NETWORK_URL,
        });
        datum.identity.storePassword(PASSWORD);
      } catch (error) {
        expect(error).to.be.null;
      }
    });

    /**
     * Get DAT from faucet
     */
    it('should get some DAT from faucet', async () => {
      try {
        const url = FAUCET_URL + datum.identity.address;
        const result = await axios.get(url);
        expect(result).to.have.property('data');
        expect(result.data).to.have.property('state');
        expect(result.data).to.have.property('txHash');
        expect(result.data.state).to.be.equal('ok');
        expect(result.data.txHash).to.be.a('string');
      } catch (error) {
        expect(error).to.be.null;
      }
    });

    /**
     * Positive balance
     */
    it('should have positive balance', done => {
      setTimeout(async () => {
        try {
          balance = Number(await Datum.getBalance(datum.identity.address));
          expect(balance).to.be.a('number');
          expect(balance).to.be.above(0);
          done();
        } catch (error) {
          expect(error).to.be.null;
        }
      }, 15000);
    })

    /**
     * Deposit storage contract
     */
    it('should deposit storage contract', async () => {
      try {
        await datum.deposit(DEPOSIT_DAT);
        const depositBalance = Number(Web3.utils.fromWei(await Datum.getDepositBalance(datum.identity.address)));
        expect(depositBalance).to.be.a('number');
        expect(depositBalance).to.be.equal(DEPOSIT_DAT);
      } catch (error) {
        expect(error).to.be.null;
      }
    });
  });

  /**
   * Usage
   */
  describe('Usage', () => {
    // before(() => {
    //   let keystore;
    //   datum.initialize({
    //     identity: [keystore],
    //     storage: STORAGE_URL,
    //     network: NETWORK_URL,
    //   });
    //   datum.identity.storePassword(PASSWORD);
    // });

    /**
     * Store data
     */
    it('should store data', async () => {
      try {
        dataHash_1 = await datum.set(DATA_1, KEYNAME);
        dataHash_2 = await datum.set(DATA_2, KEYNAME);
        expect(dataHash_1).to.be.a('string');
        expect(dataHash_2).to.be.a('string');
      } catch (error) {
        expect(error).to.be.null;
      }
    });

    /**
     * Retrieve data
     */
    it('should retrieve data', async () => {
      try {
        const data_1 = await datum.get(dataHash_1);
        const data_2 = await datum.get(dataHash_2);
        expect(data_1).to.be.a('string');
        expect(data_2).to.be.a('string');
      } catch (error) {
        expect(error).to.be.null;
      }
    });

    /**
     * Retrieve ids for keyname
     */
    it('should retrieve ids for keyname', async () => {
      try {
        const ids = await datum.getIdsForKey(KEYNAME);
        expect(ids).to.be.an('array');
        expect(ids).to.have.lengthOf(2);
      } catch (error) {
        expect(error).to.be.null;
      }
    });

    /**
     * Remove data by id
     */
    it('should remove data by id', async () => {
      try {
        const result = await datum.remove(dataHash_1);
      } catch (error) {
        expect(error).to.be.null;
      }
    });

    /**
     * Remove data by keyname
     */
    it('should remove data by keyname', async () => {
      try {
        const result = await datum.removeByKey(KEYNAME);
      } catch (error) {
        expect(error).to.be.null;
      }
    });

    /**
     * Retrieve ids for keyname
     */
    it('should retrieve ids for keyname', async () => {
      try {
        const ids = await datum.getIdsForKey(KEYNAME);
        expect(ids).to.be.an('array').that.is.empty;
      } catch (error) {
        expect(error).to.be.null;
      }
    });

    /**
     * Storage cost (1 MB / per year)
     */
    it('should get storage cost', async () => {
      try {
        const storageCost = Number(await Datum.getStorageCosts(1024 * 1024, 365));
        expect(storageCost).to.be.a('number');
      } catch (error) {
        expect(error).to.be.null;
      }
    });

    /**
     * Storage traffic cost (per GB)
     */
    it('should get storage traffic cost', async () => {
      try {
        const storageTrafficCost = Number(await Datum.getTrafficCostsGB(1));
        expect(storageTrafficCost).to.be.a('number');
      } catch (error) {
        expect(error).to.be.null;
      }
    });
  });
});
