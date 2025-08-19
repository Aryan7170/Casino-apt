#!/bin/bash

# APT Casino Gasless Infrastructure Test Script
# Tests the gasless setup without requiring Node.js runtime

echo "🚀 APT Casino Gasless Infrastructure Test"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    echo -e "\n🧪 ${BLUE}Testing: $test_name${NC}"
    
    if eval "$test_command"; then
        echo -e "✅ ${GREEN}PASS${NC}: $test_name"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "❌ ${RED}FAIL${NC}: $test_name"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo -e "\n📁 ${YELLOW}Testing Project Structure${NC}"
echo "=========================="

# Test 1: Check if key files exist
run_test "Paymaster contract exists" "[ -f 'web3-contracts/contracts/Paymaster.sol' ]"
run_test "Relayer service exists" "[ -f 'relayer-service.js' ]"
run_test "Gasless service exists" "[ -f 'src/utils/gaslessService.js' ]"
run_test "Package.json exists" "[ -f 'package.json' ]"

echo -e "\n🔧 ${YELLOW}Testing Contract Configuration${NC}"
echo "============================="

# Test 2: Check contract code for gasless features
run_test "Paymaster has unlimited gas config" "grep -q 'type(uint256).max' web3-contracts/contracts/Paymaster.sol"
run_test "Paymaster has autoWhitelistEnabled" "grep -q 'autoWhitelistEnabled = true' web3-contracts/contracts/Paymaster.sol"
run_test "Paymaster canSponsorGas returns true" "grep -q 'return (true' web3-contracts/contracts/Paymaster.sol"

echo -e "\n🌐 ${YELLOW}Testing Frontend Integration${NC}"
echo "============================"

# Test 3: Check frontend gasless integration
run_test "GaslessService class exists" "grep -q 'export class GaslessService' src/utils/gaslessService.js"
run_test "Enhanced gasless hooks exist" "grep -q 'useGaslessTransactions' src/utils/gaslessService.js"
run_test "Relayer URL configuration exists" "grep -q 'NEXT_PUBLIC_RELAYER_URL' src/utils/gaslessService.js"

echo -e "\n🔄 ${YELLOW}Testing Backend Services${NC}"
echo "======================"

# Test 4: Check relayer service configuration
run_test "Relayer service is configured" "grep -q 'Gasless Transaction Relayer Service' relayer-service.js"
run_test "Relayer has /relay endpoint" "grep -q '/relay' relayer-service.js"
run_test "Relayer has /check-gasless endpoint" "grep -q '/check-gasless' relayer-service.js"

echo -e "\n📦 ${YELLOW}Testing Dependencies${NC}"
echo "=================="

# Test 5: Check if required dependencies are listed
run_test "Ethers.js dependency exists" "grep -q '\"ethers\"' package.json"
run_test "Wagmi dependency exists" "grep -q '\"wagmi\"' package.json"
run_test "RainbowKit dependency exists" "grep -q '\"@rainbow-me/rainbowkit\"' package.json"

echo -e "\n🔍 ${YELLOW}Testing Enhanced Hooks${NC}"
echo "===================="

# Test 6: Check for enhanced hooks
if [ -f "src/hooks/useToken.js" ]; then
    run_test "useToken hook has gasless integration" "grep -q 'gasless' src/hooks/useToken.js"
else
    echo -e "⚠️  ${YELLOW}WARNING${NC}: useToken.js not found, checking for alternative token hooks"
fi

if [ -f "src/hooks/useEnhancedRoulette.js" ]; then
    run_test "Enhanced Roulette hook exists" "grep -q 'useEnhancedRoulette' src/hooks/useEnhancedRoulette.js"
else
    echo -e "ℹ️  ${BLUE}INFO${NC}: Enhanced Roulette hook not yet created"
fi

echo -e "\n📋 ${YELLOW}Testing Environment Setup${NC}"
echo "======================"

# Test 7: Check environment setup
run_test "Environment example exists" "[ -f '.env.example' ]"
run_test "Hardhat config exists" "[ -f 'web3-contracts/hardhat.config.js' ]"
run_test "Next.js config exists" "[ -f 'next.config.js' ]"

echo -e "\n🎯 ${YELLOW}Testing Game Integration${NC}"
echo "======================"

# Test 8: Check game integration
if [ -d "src/components" ]; then
    GAME_COMPONENTS=$(find src/components -name "*.js" | wc -l)
    if [ "$GAME_COMPONENTS" -gt 0 ]; then
        echo -e "✅ ${GREEN}PASS${NC}: Found $GAME_COMPONENTS game components"
        ((TESTS_PASSED++))
    else
        echo -e "❌ ${RED}FAIL${NC}: No game components found"
        ((TESTS_FAILED++))
    fi
else
    echo -e "❌ ${RED}FAIL${NC}: Components directory not found"
    ((TESTS_FAILED++))
fi

# Test 9: Check for roulette game specifically
if find src -name "*roulette*" -o -name "*Roulette*" | grep -q .; then
    run_test "Roulette game components exist" "find src -name '*roulette*' -o -name '*Roulette*' | head -1"
else
    echo -e "ℹ️  ${BLUE}INFO${NC}: No specific Roulette components found (may use generic game components)"
fi

echo -e "\n📊 ${YELLOW}Test Summary${NC}"
echo "============"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}All structural tests passed! Your gasless infrastructure is properly set up.${NC}"
    echo -e "\n📝 ${BLUE}Next Steps:${NC}"
    echo "1. Install Node.js if you want to run runtime tests"
    echo "2. Configure environment variables (.env.local)"
    echo "3. Deploy contracts to testnet"
    echo "4. Start the relayer service"
    echo "5. Test with a real wallet"
else
    echo -e "\n⚠️  ${YELLOW}Some structural issues found. Please review the failed tests above.${NC}"
fi

echo -e "\n🔗 ${BLUE}Quick Start Guide:${NC}"
echo "=================="
echo "1. Copy .env.example to .env.local and fill in contract addresses"
echo "2. Run: node relayer-service.js (in one terminal)"
echo "3. Run: npm run dev (in another terminal)"
echo "4. Connect wallet and try a transaction - it should be gasless!"

exit $TESTS_FAILED
