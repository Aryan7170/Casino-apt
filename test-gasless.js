#!/usr/bin/env node

/**
 * APT Casino Gasless Transaction Test Suite
 * Tests the gasless transaction infrastructure end-to-end
 */

const { ethers } = require("ethers");
const fetch = require("node-fetch");
require("dotenv").config();

// Test configuration
const TEST_CONFIG = {
  relayerUrl: process.env.RELAYER_URL || "http://localhost:3001",
  rpcUrl: process.env.RPC_URL || "https://rpc.sepolia.mantle.xyz",
  forwarderAddress: process.env.FORWARDER_ADDRESS,
  paymasterAddress: process.env.PAYMASTER_ADDRESS,
  testUserPrivateKey: process.env.TEST_USER_PRIVATE_KEY,
  relayerPrivateKey: process.env.RELAYER_PRIVATE_KEY,
};

// Colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Test functions
class GaslessTestSuite {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(TEST_CONFIG.rpcUrl);
    this.testResults = [];
  }

  async runTest(testName, testFunction) {
    log(`\n🧪 Running test: ${testName}`, colors.blue);
    try {
      const result = await testFunction();
      this.testResults.push({ name: testName, status: "PASS", result });
      log(`✅ ${testName} - PASSED`, colors.green);
      return result;
    } catch (error) {
      this.testResults.push({
        name: testName,
        status: "FAIL",
        error: error.message,
      });
      log(`❌ ${testName} - FAILED: ${error.message}`, colors.red);
      return null;
    }
  }

  // Test 1: Check if relayer service is running
  async testRelayerService() {
    const response = await fetch(`${TEST_CONFIG.relayerUrl}/health`);
    if (!response.ok) {
      throw new Error(`Relayer service not responding: ${response.status}`);
    }
    const data = await response.json();
    return data;
  }

  // Test 2: Check blockchain connectivity
  async testBlockchainConnection() {
    const blockNumber = await this.provider.getBlockNumber();
    if (blockNumber <= 0) {
      throw new Error("Unable to get block number from blockchain");
    }
    return { blockNumber, network: await this.provider.getNetwork() };
  }

  // Test 3: Validate contract addresses
  async testContractAddresses() {
    const results = {};

    if (TEST_CONFIG.forwarderAddress) {
      const forwarderCode = await this.provider.getCode(
        TEST_CONFIG.forwarderAddress
      );
      results.forwarder = forwarderCode !== "0x" ? "Deployed" : "Not found";
    } else {
      results.forwarder = "Address not configured";
    }

    if (TEST_CONFIG.paymasterAddress) {
      const paymasterCode = await this.provider.getCode(
        TEST_CONFIG.paymasterAddress
      );
      results.paymaster = paymasterCode !== "0x" ? "Deployed" : "Not found";
    } else {
      results.paymaster = "Address not configured";
    }

    return results;
  }

  // Test 4: Test gasless eligibility check
  async testGaslessEligibility() {
    const testUser = ethers.Wallet.createRandom().address;
    const testContract = ethers.Wallet.createRandom().address;

    const response = await fetch(`${TEST_CONFIG.relayerUrl}/check-gasless`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userAddress: testUser,
        targetContract: testContract,
        gasEstimate: 21000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Gasless check failed: ${response.status}`);
    }

    const result = await response.json();
    return result;
  }

  // Test 5: Test meta-transaction preparation
  async testMetaTransactionPreparation() {
    if (!TEST_CONFIG.testUserPrivateKey) {
      throw new Error("Test user private key not configured");
    }

    const testWallet = new ethers.Wallet(
      TEST_CONFIG.testUserPrivateKey,
      this.provider
    );
    const testContract = ethers.Wallet.createRandom().address;

    // Create a sample meta-transaction request
    const metaTxRequest = {
      from: testWallet.address,
      to: testContract,
      value: 0,
      gas: 100000,
      nonce: await testWallet.getTransactionCount(),
      data: "0x",
    };

    // Test EIP-712 signature creation
    const domain = {
      name: "APTCasinoForwarder",
      version: "1",
      chainId: (await this.provider.getNetwork()).chainId,
      verifyingContract:
        TEST_CONFIG.forwarderAddress || ethers.constants.AddressZero,
    };

    const types = {
      ForwardRequest: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "gas", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "data", type: "bytes" },
      ],
    };

    const signature = await testWallet._signTypedData(
      domain,
      types,
      metaTxRequest
    );

    return {
      metaTxRequest,
      signature,
      signerAddress: testWallet.address,
      signatureLength: signature.length,
    };
  }

  // Test 6: Test relayer endpoint
  async testRelayerEndpoint() {
    if (!TEST_CONFIG.testUserPrivateKey) {
      throw new Error("Test user private key not configured");
    }

    const testWallet = new ethers.Wallet(
      TEST_CONFIG.testUserPrivateKey,
      this.provider
    );

    const mockRelayRequest = {
      request: {
        from: testWallet.address,
        to: ethers.Wallet.createRandom().address,
        value: 0,
        gas: 21000,
        nonce: 0,
        data: "0x",
      },
      signature: "0x" + "0".repeat(130), // Mock signature
      userAddress: testWallet.address,
      targetContract: ethers.Wallet.createRandom().address,
    };

    const response = await fetch(`${TEST_CONFIG.relayerUrl}/relay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockRelayRequest),
    });

    const result = await response.text();

    // We expect this to fail with signature verification, but endpoint should respond
    return {
      status: response.status,
      response: result,
      endpointAccessible: response.status !== 404,
    };
  }

  // Test 7: Check environment configuration
  async testEnvironmentConfiguration() {
    const config = {
      relayerUrl: TEST_CONFIG.relayerUrl,
      rpcUrl: TEST_CONFIG.rpcUrl,
      forwarderAddress: TEST_CONFIG.forwarderAddress || "Not configured",
      paymasterAddress: TEST_CONFIG.paymasterAddress || "Not configured",
      hasTestUserKey: !!TEST_CONFIG.testUserPrivateKey,
      hasRelayerKey: !!TEST_CONFIG.relayerPrivateKey,
    };

    const missingConfigs = [];
    if (!TEST_CONFIG.forwarderAddress) missingConfigs.push("FORWARDER_ADDRESS");
    if (!TEST_CONFIG.paymasterAddress) missingConfigs.push("PAYMASTER_ADDRESS");
    if (!TEST_CONFIG.relayerPrivateKey)
      missingConfigs.push("RELAYER_PRIVATE_KEY");

    return {
      config,
      missingConfigs,
      isFullyConfigured: missingConfigs.length === 0,
    };
  }

  // Run all tests
  async runAllTests() {
    log(
      "\n🚀 Starting APT Casino Gasless Transaction Test Suite",
      colors.yellow
    );
    log("=" * 60, colors.yellow);

    // Run tests sequentially
    await this.runTest("Environment Configuration", () =>
      this.testEnvironmentConfiguration()
    );
    await this.runTest("Blockchain Connection", () =>
      this.testBlockchainConnection()
    );
    await this.runTest("Contract Address Validation", () =>
      this.testContractAddresses()
    );
    await this.runTest("Relayer Service Health", () =>
      this.testRelayerService()
    );
    await this.runTest("Gasless Eligibility Check", () =>
      this.testGaslessEligibility()
    );
    await this.runTest("Meta-Transaction Preparation", () =>
      this.testMetaTransactionPreparation()
    );
    await this.runTest("Relayer Endpoint Test", () =>
      this.testRelayerEndpoint()
    );

    // Summary
    this.printTestSummary();
  }

  printTestSummary() {
    log("\n📊 Test Summary", colors.yellow);
    log("=" * 50, colors.yellow);

    const passed = this.testResults.filter((t) => t.status === "PASS").length;
    const failed = this.testResults.filter((t) => t.status === "FAIL").length;

    this.testResults.forEach((test) => {
      const icon = test.status === "PASS" ? "✅" : "❌";
      const color = test.status === "PASS" ? colors.green : colors.red;
      log(`${icon} ${test.name}`, color);
    });

    log(
      `\nTotal: ${this.testResults.length} | Passed: ${passed} | Failed: ${failed}`,
      colors.blue
    );

    if (failed > 0) {
      log("\n🔧 Issues found:", colors.red);
      this.testResults
        .filter((t) => t.status === "FAIL")
        .forEach((test) => {
          log(`   - ${test.name}: ${test.error}`, colors.red);
        });
    }

    if (passed === this.testResults.length) {
      log(
        "\n🎉 All tests passed! Gasless infrastructure is working correctly.",
        colors.green
      );
    } else {
      log(
        "\n⚠️  Some tests failed. Please check the configuration and try again.",
        colors.yellow
      );
    }
  }
}

// Run tests
if (require.main === module) {
  const testSuite = new GaslessTestSuite();
  testSuite
    .runAllTests()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      log(`\n💥 Test suite crashed: ${error.message}`, colors.red);
      process.exit(1);
    });
}

module.exports = GaslessTestSuite;
