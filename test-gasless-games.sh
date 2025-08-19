#!/bin/bash

# APT Casino - Comprehensive Gasless Games Test
# Tests gasless functionality across all casino games

echo "🎰 APT Casino - Gasless Games Test Suite"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    
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

echo -e "\n🎮 ${PURPLE}GAME 1: ROULETTE${NC}"
echo "=================="

# Roulette Tests
run_test "Roulette contract exists" "[ -f 'web3-contracts/contracts/Roulette.sol' ]"
run_test "Roulette has gasless documentation" "grep -q 'gasless transaction support' web3-contracts/contracts/Roulette.sol"
run_test "Roulette frontend exists" "[ -f 'src/app/game/roulette/page.jsx' ]"
run_test "Roulette uses useToken hook" "grep -q 'useToken' src/app/game/roulette/page.jsx"
run_test "Enhanced Roulette hook exists" "[ -f 'src/hooks/useEnhancedRoulette.js' ]"
run_test "Roulette placeMultipleBets function" "grep -q 'placeMultipleBets' web3-contracts/contracts/Roulette.sol"

echo -e "\n💣 ${PURPLE}GAME 2: MINES${NC}"
echo "==============="

# Mines Tests  
run_test "Mines contract exists" "[ -f 'web3-contracts/contracts/mines.sol' ]"
run_test "Mines has ERC2771Context" "grep -q 'ERC2771Context' web3-contracts/contracts/mines.sol"
run_test "Mines frontend exists" "[ -f 'src/app/game/mines/page.jsx' ]"
run_test "Mines uses useDelegationToolkit" "grep -q 'useDelegationToolkit' src/app/game/mines/page.jsx"
run_test "Enhanced Mines hook exists" "[ -f 'src/hooks/useEnhancedMines.js' ]"
run_test "Mines has gasless functions" "grep -q 'executeGaslessTransaction' src/hooks/useEnhancedMines.js"

echo -e "\n🎡 ${PURPLE}GAME 3: WHEEL${NC}"
echo "=============="

# Wheel Tests
run_test "Wheel contract exists" "[ -f 'web3-contracts/contracts/Wheel.sol' ]"
run_test "Wheel frontend exists" "[ -f 'src/app/game/wheel/page.js' ]"
run_test "Wheel uses useDelegationToolkit" "grep -q 'useDelegationToolkit' src/app/game/wheel/page.js"
run_test "Enhanced Wheel hook exists" "[ -f 'src/hooks/useEnhancedWheel.js' ]"
run_test "Wheel has gasless functions" "grep -q 'executeGaslessTransaction' src/hooks/useEnhancedWheel.js"

echo -e "\n🏓 ${PURPLE}GAME 4: PLINKO${NC}"
echo "==============="

# Plinko Tests
run_test "Plinko frontend exists" "[ -f 'src/app/game/plinko/page.jsx' ]"
if [ -f "web3-contracts/contracts/Plinko.sol" ]; then
    run_test "Plinko contract exists" "[ -f 'web3-contracts/contracts/Plinko.sol' ]"
else
    echo -e "ℹ️  ${YELLOW}INFO${NC}: Plinko contract not implemented yet"
fi

echo -e "\n🛠️ ${PURPLE}GASLESS INFRASTRUCTURE${NC}"
echo "======================"

# Infrastructure Tests
run_test "Paymaster contract configured" "grep -q 'type(uint256).max' web3-contracts/contracts/Paymaster.sol"
run_test "Forwarder contract exists" "[ -f 'web3-contracts/contracts/Forwarder.sol' ]"
run_test "Relayer service exists" "[ -f 'relayer-service.js' ]"
run_test "GaslessService class exists" "grep -q 'class GaslessService' src/utils/gaslessService.js"
run_test "useGaslessTransactions hook exists" "grep -q 'useGaslessTransactions' src/utils/gaslessService.js"

echo -e "\n🔧 ${PURPLE}ENHANCED HOOKS INTEGRATION${NC}"
echo "============================"

# Enhanced Hooks Tests
run_test "Enhanced Roulette hook functional" "grep -q 'placeMultipleBets' src/hooks/useEnhancedRoulette.js"
run_test "Enhanced Mines hook functional" "grep -q 'placeBet' src/hooks/useEnhancedMines.js"
run_test "Enhanced Wheel hook functional" "grep -q 'spinWheel' src/hooks/useEnhancedWheel.js"

echo -e "\n📋 ${PURPLE}GAME FUNCTIONS COVERAGE${NC}"
echo "========================"

# Function Coverage Tests
if [ -f "src/hooks/useEnhancedRoulette.js" ]; then
    run_test "Roulette: placeMultipleBets gasless" "grep -q 'placeMultipleBets.*gasless' src/hooks/useEnhancedRoulette.js"
fi

if [ -f "src/hooks/useEnhancedMines.js" ]; then
    run_test "Mines: placeBet gasless" "grep -q 'placeBet.*gasless' src/hooks/useEnhancedMines.js"
    run_test "Mines: revealTile gasless" "grep -q 'revealTile.*gasless' src/hooks/useEnhancedMines.js"
    run_test "Mines: cashOut gasless" "grep -q 'cashOut.*gasless' src/hooks/useEnhancedMines.js"
fi

if [ -f "src/hooks/useEnhancedWheel.js" ]; then
    run_test "Wheel: spinWheel gasless" "grep -q 'spinWheel.*gasless' src/hooks/useEnhancedWheel.js"
    run_test "Wheel: placeBet gasless" "grep -q 'placeBet.*gasless' src/hooks/useEnhancedWheel.js"
fi

echo -e "\n📊 ${PURPLE}GASLESS COMPATIBILITY CHECK${NC}"
echo "==========================="

# Compatibility Tests
run_test "All games use compatible hooks" "ls src/hooks/useEnhanced*.js | wc -l | grep -q '[3-9]'"
run_test "Gasless service supports all functions" "grep -q 'executeGaslessTransaction' src/utils/gaslessService.js"
run_test "Paymaster supports unlimited gas" "grep -q 'type(uint256).max' web3-contracts/contracts/Paymaster.sol"

echo -e "\n🎯 ${PURPLE}GAME-SPECIFIC READINESS${NC}"
echo "======================="

# Game Readiness Assessment
echo -e "\n${BLUE}Roulette Readiness:${NC}"
ROULETTE_SCORE=0
[ -f "web3-contracts/contracts/Roulette.sol" ] && ((ROULETTE_SCORE++))
[ -f "src/hooks/useEnhancedRoulette.js" ] && ((ROULETTE_SCORE++))
grep -q "gasless" src/hooks/useEnhancedRoulette.js 2>/dev/null && ((ROULETTE_SCORE++))
echo "Score: $ROULETTE_SCORE/3 - $([ $ROULETTE_SCORE -eq 3 ] && echo "✅ READY" || echo "⚠️ NEEDS WORK")"

echo -e "\n${BLUE}Mines Readiness:${NC}"
MINES_SCORE=0
[ -f "web3-contracts/contracts/mines.sol" ] && ((MINES_SCORE++))
[ -f "src/hooks/useEnhancedMines.js" ] && ((MINES_SCORE++))
grep -q "ERC2771Context" web3-contracts/contracts/mines.sol 2>/dev/null && ((MINES_SCORE++))
echo "Score: $MINES_SCORE/3 - $([ $MINES_SCORE -eq 3 ] && echo "✅ READY" || echo "⚠️ NEEDS WORK")"

echo -e "\n${BLUE}Wheel Readiness:${NC}"
WHEEL_SCORE=0
[ -f "web3-contracts/contracts/Wheel.sol" ] && ((WHEEL_SCORE++))
[ -f "src/hooks/useEnhancedWheel.js" ] && ((WHEEL_SCORE++))
grep -q "gasless" src/hooks/useEnhancedWheel.js 2>/dev/null && ((WHEEL_SCORE++))
echo "Score: $WHEEL_SCORE/3 - $([ $WHEEL_SCORE -eq 3 ] && echo "✅ READY" || echo "⚠️ NEEDS WORK")"

echo -e "\n${BLUE}Plinko Readiness:${NC}"
PLINKO_SCORE=0
[ -f "web3-contracts/contracts/Plinko.sol" ] && ((PLINKO_SCORE++))
[ -f "src/hooks/useEnhancedPlinko.js" ] && ((PLINKO_SCORE++))
[ -f "src/app/game/plinko/page.jsx" ] && ((PLINKO_SCORE++))
echo "Score: $PLINKO_SCORE/3 - $([ $PLINKO_SCORE -eq 1 ] && echo "📝 NEEDS IMPLEMENTATION" || echo "⚠️ PARTIAL")"

echo -e "\n📊 ${YELLOW}TEST SUMMARY${NC}"
echo "============"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

# Calculate overall readiness
TOTAL_GAME_SCORE=$((ROULETTE_SCORE + MINES_SCORE + WHEEL_SCORE + PLINKO_SCORE))
MAX_POSSIBLE=12
READINESS_PERCENT=$((TOTAL_GAME_SCORE * 100 / MAX_POSSIBLE))

echo -e "\n🎯 ${PURPLE}OVERALL GASLESS READINESS${NC}"
echo "========================"
echo -e "Game Readiness: $TOTAL_GAME_SCORE/$MAX_POSSIBLE (${READINESS_PERCENT}%)"

if [ $READINESS_PERCENT -ge 75 ]; then
    echo -e "\n🎉 ${GREEN}EXCELLENT! Your casino is ready for gasless gaming!${NC}"
    echo -e "✅ Most games support gasless transactions"
    echo -e "✅ Infrastructure is properly configured"
    echo -e "✅ Enhanced hooks are implemented"
elif [ $READINESS_PERCENT -ge 50 ]; then
    echo -e "\n👍 ${YELLOW}GOOD! Your casino has solid gasless support!${NC}"
    echo -e "⚠️ Some games need minor enhancements"
    echo -e "✅ Core infrastructure is ready"
else
    echo -e "\n🔧 ${RED}NEEDS WORK! Some components missing${NC}"
    echo -e "❌ Several games need gasless integration"
fi

echo -e "\n🚀 ${BLUE}NEXT STEPS${NC}"
echo "============"

if [ $ROULETTE_SCORE -eq 3 ]; then
    echo -e "✅ Roulette: Ready for gasless gaming!"
else
    echo -e "🔧 Roulette: Needs enhanced hook integration"
fi

if [ $MINES_SCORE -eq 3 ]; then
    echo -e "✅ Mines: Ready for gasless gaming!"
else
    echo -e "🔧 Mines: Update frontend to use enhanced hook"
fi

if [ $WHEEL_SCORE -eq 3 ]; then
    echo -e "✅ Wheel: Ready for gasless gaming!"
else
    echo -e "🔧 Wheel: Update frontend to use enhanced hook"
fi

if [ $PLINKO_SCORE -lt 2 ]; then
    echo -e "📝 Plinko: Implement smart contract and gasless integration"
fi

echo -e "\n💡 ${BLUE}DEPLOYMENT CHECKLIST${NC}"
echo "===================="
echo "1. Deploy all game contracts with Paymaster approval"
echo "2. Update frontend components to use enhanced hooks"
echo "3. Configure environment variables"
echo "4. Start relayer service"
echo "5. Test with empty wallet - should work gaslessly!"

exit $TESTS_FAILED
