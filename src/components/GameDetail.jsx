"use client";
import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Box, Typography, Container, Grid, Paper, Avatar, Tabs, Tab, Button, Tooltip, LinearProgress } from '@mui/material';
import Image from 'next/image';
import { FaChartLine, FaInfoCircle, FaHistory, FaQuestionCircle, FaTrophy, FaFire, FaCoins, FaChartBar, FaClock } from 'react-icons/fa';

// Custom TabPanel component
const TabPanel = ({ children, value, index, ...props }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`game-tabpanel-${index}`}
    aria-labelledby={`game-tab-${index}`}
    {...props}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

// A tab accessor function for accessibility
const a11yProps = (index) => ({
  id: `game-tab-${index}`,
  'aria-controls': `game-tabpanel-${index}`,
});

// Custom YouTube video component
const YouTubeVideo = ({ videoId }) => {
  if (!videoId) return null;
  
  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      paddingTop: '56.25%', // 16:9 Aspect Ratio
      mb: 4 
    }}>
      <iframe
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        src={videoId}
        title="Roulette Tutorial"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </Box>
  );
};

// Memoized components for better performance
const MemoizedTabPanel = React.memo(TabPanel);
const MemoizedYouTubeVideo = React.memo(YouTubeVideo);

// Lazy loaded tab contents
const BettingOptionsContent = lazy(() => import('./BettingTable'));
const GameHistoryContent = lazy(() => import('./GameHistory'));
const FAQContent = lazy(() => import('./FAQContent'));

const GameDetail = ({ gameData = {}, bettingTableData = {} }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Memoize expensive calculations
  const hotNumbers = useMemo(() => [19, 7, 32], []);
  const coldNumbers = useMemo(() => [13, 6, 34], []);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Memoize the game stats for better performance
  const gameStats = useMemo(() => [
    { label: 'House Edge', value: '2.70%' },
    { label: 'RTP', value: '97.30%' },
    { label: 'Max Win', value: '35x' }
  ], []);

  // Memoize game statistics
  const gameStatistics = useMemo(() => ({
    totalBets: '1,234,567',
    totalVolume: '5.6M APTC',
    avgBetSize: '245 APTC',
    maxWin: '35,000 APTC'
  }), []);

  // Memoize recent big wins
  const recentBigWins = useMemo(() => [
    { player: "LuckyDragon", amount: "12,500 APTC", time: "2m ago", bet: "Straight Up" },
    { player: "CryptoWhale", amount: "8,750 APTC", time: "5m ago", bet: "Split" },
    { player: "RoulettePro", amount: "6,300 APTC", time: "12m ago", bet: "Corner" }
  ], []);

  // Add win probability data
  const winProbabilities = useMemo(() => [
    { type: 'Even/Odd', probability: 48.6 },
    { type: 'Red/Black', probability: 48.6 },
    { type: 'Dozens', probability: 32.4 },
    { type: 'Single Number', probability: 2.7 }
  ], []);

  return (
    <Box
      id="game-details"
      sx={{
        py: 10,
        px: { xs: 2, md: 8 },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(104, 29, 219, 0.2) 0%, transparent 40%),
          radial-gradient(circle at 90% 90%, rgba(216, 38, 51, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 10% 90%, rgba(20, 216, 84, 0.1) 0%, transparent 40%)
        `,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background accents */}
      <Box 
        sx={{ 
          position: 'absolute', 
          right: -100, 
          top: -100, 
          width: 300, 
          height: 300, 
          borderRadius: '50%', 
          background: 'radial-gradient(circle, rgba(216, 38, 51, 0.2) 0%, transparent 70%)',
          filter: 'blur(50px)',
          zIndex: 0
        }} 
      />
      <Box 
        sx={{ 
          position: 'absolute', 
          left: -50, 
          bottom: -50, 
          width: 250, 
          height: 250, 
          borderRadius: '50%', 
          background: 'radial-gradient(circle, rgba(104, 29, 219, 0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 0
        }} 
      />
      
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6}>
          {/* Left side content */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'relative' }}>
              {/* Enhance game image paper */}
              <Paper
                elevation={5}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  transform: activeTab === 0 ? 'scale(1)' : 'scale(0.95)',
                  opacity: activeTab === 0 ? 1 : 0.7,
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                  height: { xs: '250px', md: '400px' },
                  position: 'relative',
                  '&:hover': {
                    boxShadow: '0 15px 40px rgba(104, 29, 219, 0.3)',
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                {gameData.image && (
                  <Image
                    src={gameData.image}
                    alt={gameData.title || "Game"}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                    priority
                  />
                )}
                
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                    p: 3
                  }}
                >
                  <Typography variant="overline" color="primary.main2">
                    {gameData.label || "GAME DESCRIPTION"}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="white">
                    {gameData.title || "Game Title"}
                  </Typography>
                </Box>
              </Paper>
              
              {/* Game stats quick view */}
              <Paper
                elevation={4}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  mt: -3,
                  ml: 4,
                  mr: 4,
                  position: 'relative',
                  zIndex: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-around'
                }}
              >
                {gameStats.map((stat, index) => (
                  <Box key={index} sx={{ textAlign: 'center' }}>
                    <Typography color="primary.main1" variant="caption">
                      {stat.label}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="white">
                      {stat.value}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Box>
            
            {/* Enhanced Game Statistics */}
            <Paper
              elevation={3}
              sx={{
                mt: 4,
                p: 3,
                borderRadius: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                position: 'relative',
                overflow: 'hidden',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #14D854, #681DDB, #d82633)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FaChartBar style={{ color: '#14D854', marginRight: '8px', fontSize: '1.5rem' }} />
                <Typography variant="h6" fontWeight="bold" color="white">
                  Game Statistics
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {Object.entries(gameStatistics).map(([key, value], index) => (
                  <Grid item xs={6} key={key}>
                    <Tooltip title={`Current ${key.replace(/([A-Z])/g, ' $1').trim()}`} arrow placement="top">
                      <Box 
                        sx={{ 
                          p: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            '& .stat-highlight': {
                              opacity: 1,
                              transform: 'translateY(0)'
                            }
                          },
                          '&:after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: index === 0 ? '#14D854' : 
                                       index === 1 ? '#681DDB' : 
                                       index === 2 ? '#f5b014' : '#d82633',
                            opacity: 0.7
                          }
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'rgba(255,255,255,0.7)',
                            textTransform: 'uppercase',
                            fontSize: '0.7rem',
                            letterSpacing: '1px',
                            mb: 0.5,
                            display: 'block'
                          }}
                        >
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            background: index === 0 ? 'linear-gradient(45deg, #14D854, #0A9B3D)' :
                                      index === 1 ? 'linear-gradient(45deg, #681DDB, #4A14A0)' :
                                      index === 2 ? 'linear-gradient(45deg, #f5b014, #B37F0E)' :
                                      'linear-gradient(45deg, #d82633, #9E1C25)',
                            backgroundClip: 'text',
                            textFillColor: 'transparent'
                          }}
                        >
                          {value}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>

              {/* Win Probability Section */}
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Typography variant="subtitle2" color="white" sx={{ mb: 2 }}>
                  Win Probabilities
                </Typography>
                {winProbabilities.map((item, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="rgba(255,255,255,0.7)">
                        {item.type}
                      </Typography>
                      <Typography variant="caption" color="white" fontWeight="bold">
                        {item.probability}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={item.probability}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: index === 0 ? 'linear-gradient(90deg, #14D854, #0A9B3D)' :
                                    index === 1 ? 'linear-gradient(90deg, #681DDB, #4A14A0)' :
                                    index === 2 ? 'linear-gradient(90deg, #f5b014, #B37F0E)' :
                                    'linear-gradient(90deg, #d82633, #9E1C25)',
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Enhanced Recent Big Wins */}
            <Paper
              elevation={3}
              sx={{
                mt: 4,
                p: 3,
                borderRadius: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                position: 'relative',
                overflow: 'hidden',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #f5b014, #d82633)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FaFire style={{ color: '#f5b014', marginRight: '8px', fontSize: '1.5rem' }} />
                <Typography variant="h6" fontWeight="bold" color="white">
                  Recent Big Wins
                </Typography>
              </Box>
              
              {recentBigWins.map((win, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    mb: index < recentBigWins.length - 1 ? 2 : 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateX(8px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.dark',
                        width: 40,
                        height: 40,
                        mr: 2,
                        border: '2px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {win.player.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography color="white" variant="body2" fontWeight="bold">
                        {win.player}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          color="primary.main2" 
                          variant="caption"
                          sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            backgroundColor: 'rgba(216,38,51,0.1)',
                            border: '1px solid rgba(216,38,51,0.2)'
                          }}
                        >
                          {win.bet}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography 
                      color="success.main" 
                      variant="body2" 
                      fontWeight="bold"
                      sx={{
                        background: 'linear-gradient(90deg, #14D854, #0A9B3D)',
                        backgroundClip: 'text',
                        textFillColor: 'transparent'
                      }}
                    >
                      +{win.amount}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <FaClock style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginRight: '4px' }} />
                      <Typography color="rgba(255,255,255,0.5)" variant="caption">
                        {win.time}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Paper>
          </Grid>
          
          {/* Game info tabs section */}
          <Grid item xs={12} md={8}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                aria-label="game information tabs"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                sx={{ '& .MuiTab-root': { py: 2 } }}
              >
                <Tab 
                  label="Game Description" 
                  icon={<FaInfoCircle />} 
                  iconPosition="start" 
                  {...a11yProps(0)} 
                />
                <Tab 
                  label="Betting Options" 
                  icon={<FaChartLine />} 
                  iconPosition="start" 
                  {...a11yProps(1)} 
                />
                <Tab 
                  label="Game History" 
                  icon={<FaHistory />} 
                  iconPosition="start" 
                  {...a11yProps(2)} 
                />
                <Tab 
                  label="FAQs" 
                  icon={<FaQuestionCircle />} 
                  iconPosition="start" 
                  {...a11yProps(3)} 
                />
              </Tabs>
            </Box>
            
            {/* Game Description Panel */}
            <MemoizedTabPanel value={activeTab} index={0}>
              {gameData.paragraphs?.map((paragraph, index) => {
                // Check if the paragraph is a YouTube video URL
                if (paragraph.includes('youtube.com/embed/')) {
                  return <MemoizedYouTubeVideo key={index} videoId={paragraph} />;
                }
                
                // Check if the paragraph is a section header (contains emoji)
                if (paragraph.includes('🎯') || paragraph.includes('🎲') || 
                    paragraph.includes('💰') || paragraph.includes('📺') || 
                    paragraph.includes('💡') || paragraph.includes('⚠️')) {
                  return (
                    <Typography 
                      key={index} 
                      variant="h5" 
                      sx={{ 
                        mt: 4,
                        mb: 2,
                        background: 'linear-gradient(90deg, rgba(216,38,51,1) 0%, rgba(104,29,219,1) 100%)',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        fontWeight: 'bold',
                        letterSpacing: '0.5px',
                        fontSize: '1.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        position: 'relative',
                        pl: 1,
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '4px',
                          height: '70%',
                          background: 'linear-gradient(180deg, rgba(216,38,51,1) 0%, rgba(104,29,219,1) 100%)',
                          borderRadius: '4px'
                        }
                      }}
                    >
                      {paragraph}
                    </Typography>
                  );
                }
                
                // Check if the paragraph is a divider
                if (paragraph.includes('━')) {
                  return (
                    <Box 
                      key={index} 
                      sx={{ 
                        mb: 2,
                        opacity: 0.3
                      }}
                    >
                      {paragraph}
                    </Box>
                  );
                }
                
                // Check if the paragraph starts with a bullet point
                if (paragraph.trim().startsWith('•')) {
                  return (
                    <Typography 
                      key={index} 
                      variant="body1" 
                      sx={{ 
                        mb: 1.5,
                        color: 'white',
                        pl: 2,
                        position: 'relative',
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '6px',
                          height: '6px',
                          background: 'linear-gradient(90deg, rgba(216,38,51,1) 0%, rgba(104,29,219,1) 100%)',
                          borderRadius: '50%'
                        }
                      }}
                    >
                      {paragraph.replace('•', '')}
                    </Typography>
                  );
                }
                
                // Check if the paragraph starts with a number (for tips)
                if (paragraph.trim().match(/^\d+\./)) {
                  return (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        mb: 1.5,
                        alignItems: 'flex-start'
                      }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, rgba(216,38,51,0.2) 0%, rgba(104,29,219,0.2) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1.5,
                          border: '1px solid rgba(255,255,255,0.1)',
                          flexShrink: 0
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            color: 'white'
                          }}
                        >
                          {paragraph.split('.')[0]}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'white',
                          pt: 0.5
                        }}
                      >
                        {paragraph.replace(/^\d+\./, '')}
                      </Typography>
                    </Box>
                  );
                }
                
                // Regular text paragraph with letter spacing and line height
                return (
                  <Typography 
                    key={index} 
                    variant="body1" 
                    paragraph
                    sx={{ 
                      mb: 2,
                      color: 'white',
                      whiteSpace: 'pre-line',
                      lineHeight: 1.7,
                      letterSpacing: 0.3,
                      fontSize: '1rem',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      ...(index === 0 && {
                        fontSize: '1.1rem',
                        fontWeight: 'medium',
                        borderLeft: '2px solid rgba(216,38,51,0.7)',
                        pl: 2,
                        py: 1,
                        borderRadius: '2px'
                      })
                    }}
                  >
                    {paragraph}
                  </Typography>
                );
              })}
              
              {/* Improved responsible gaming box */}
              {activeTab === 0 && (
                <Box
                  sx={{
                    mt: 6,
                    p: 0,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(20,0,20,0.8) 100%)',
                    border: '1px solid rgba(216,38,51,0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}
                >
                  {/* Decorative elements */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '140px',
                      height: '140px',
                      background: 'radial-gradient(circle at center, rgba(216,38,51,0.15), transparent 70%)',
                      zIndex: 0
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '120px',
                      height: '120px',
                      background: 'radial-gradient(circle at center, rgba(104,29,219,0.15), transparent 70%)',
                      zIndex: 0
                    }}
                  />
                  
                  {/* Header */}
                  <Box 
                    sx={{
                      p: 3,
                      background: 'linear-gradient(90deg, rgba(216,38,51,0.2) 0%, rgba(104,29,219,0.2) 100%)',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <Box 
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #d82633 0%, #8B2398 100%)',
                        flexShrink: 0
                      }}
                    >
                      <Box component="span" sx={{ fontSize: '1.6rem', color: 'white' }}>⚠️</Box>
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        background: 'linear-gradient(90deg, #d82633 0%, #681DDB 100%)',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        fontWeight: 'bold',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Responsible Gaming
                    </Typography>
                  </Box>
                  
                  {/* Content */}
                  <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
                      At APT Casino, we're committed to providing a safe gaming environment. Remember these key practices:
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {[
                        { title: "Set Limits", text: "Establish time and money limits before playing" },
                        { title: "Play for Fun", text: "Treat gambling as entertainment, not as a source of income" },
                        { title: "Take Breaks", text: "Regular breaks help maintain perspective" },
                        { title: "Never Chase Losses", text: "Accepting losses is part of responsible gaming" }
                      ].map((item, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: 'linear-gradient(90deg, #d82633 0%, #681DDB 100%)',
                                mt: 1.5,
                                flexShrink: 0
                              }}
                            />
                            <Box>
                              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                                {item.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
                                {item.text}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    
                    <Box
                      sx={{
                        mt: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', opacity: 0.6 }}>
                        Need help? Visit our Responsible Gaming page for resources.
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ 
                          borderColor: 'rgba(216,38,51,0.5)', 
                          color: 'white',
                          '&:hover': {
                            borderColor: '#d82633',
                            backgroundColor: 'rgba(216,38,51,0.1)'
                          }
                        }}
                        href="/responsible-gaming"
                        target="_blank"
                      >
                        Learn More
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </MemoizedTabPanel>
            
            {/* Betting Options Panel */}
            <MemoizedTabPanel value={activeTab} index={1}>
              <Suspense fallback={<div>Loading betting options...</div>}>
                <BettingOptionsContent data={bettingTableData} />
              </Suspense>
            </MemoizedTabPanel>
            
            {/* Game History Panel */}
            <MemoizedTabPanel value={activeTab} index={2}>
              <Suspense fallback={<div>Loading game history...</div>}>
                <GameHistoryContent hotNumbers={hotNumbers} coldNumbers={coldNumbers} />
              </Suspense>
            </MemoizedTabPanel>
            
            {/* FAQs Panel */}
            <MemoizedTabPanel value={activeTab} index={3}>
              <Suspense fallback={<div>Loading FAQs...</div>}>
                <FAQContent />
              </Suspense>
            </MemoizedTabPanel>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default GameDetail;
