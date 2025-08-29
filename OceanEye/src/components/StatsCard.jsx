import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { motion } from 'framer-motion';

const StatsCard = ({
  title,
  value,
  suffix = '',
  change,
  changeType,
  icon,
  color = 'primary',
  onClick
}) => {
  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp sx={{ fontSize: 16 }} />;
      case 'decrease':
        return <TrendingDown sx={{ fontSize: 16 }} />;
      default:
        return <TrendingFlat sx={{ fontSize: 16 }} />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'success.main';
      case 'decrease':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': {
            boxShadow: onClick ? 6 : 2,
          },
        }}
        onClick={onClick}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.875rem', mb: 1 }}
              >
                {title}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  color: `${color}.main`,
                }}
              >
                {value}
                {suffix && (
                  <Typography
                    component="span"
                    variant="h6"
                    sx={{ color: 'text.secondary', ml: 0.5 }}
                  >
                    {suffix}
                  </Typography>
                )}
              </Typography>
              {change && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: getChangeColor(),
                    }}
                  >
                    {getChangeIcon()}
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        ml: 0.25,
                      }}
                    >
                      {change}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: '0.8rem' }}
                  >
                    vs last period
                  </Typography>
                </Box>
              )}
            </Box>
            <IconButton
              sx={{
                backgroundColor: `${color}.50`,
                color: `${color}.main`,
                '&:hover': {
                  backgroundColor: `${color}.100`,
                },
              }}
            >
              {icon}
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
