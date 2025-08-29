import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Collapse,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  Warning,
  Notifications,
  Map,
  Analytics,
  People,
  Settings,
  ExpandLess,
  ExpandMore,
  TrendingUp,
  LocationOn,
  Assessment,
  Nature,
  Security,
  Timeline,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 280;

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState({});

  const handleItemClick = (path, hasChildren = false) => {
    if (hasChildren) {
      setExpandedItems(prev => ({
        ...prev,
        [path]: !prev[path]
      }));
    } else {
      navigate(path);
      if (onClose) onClose();
    }
  };

  const isActive = (path) => location.pathname === path;

  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      {
        text: 'Dashboard',
        icon: <Dashboard />,
        path: '/dashboard',
        badge: null,
      },
      {
        text: 'Threats',
        icon: <Warning />,
        path: '/threats',
        badge: { count: 12, color: 'error' },
        children: [
          { text: 'Active Threats', path: '/threats/active', icon: <Warning /> },
          { text: 'Predictions', path: '/threats/predictions', icon: <TrendingUp /> },
          { text: 'History', path: '/threats/history', icon: <Timeline /> },
        ]
      },
      {
        text: 'Alerts',
        icon: <Notifications />,
        path: '/alerts',
        badge: { count: 5, color: 'warning' },
      },
      {
        text: 'Blue Carbon',
        icon: <Nature />,
        path: '/blue-carbon',
        children: [
          { text: 'Habitats', path: '/blue-carbon/habitats', icon: <Nature /> },
          { text: 'Impact Assessment', path: '/blue-carbon/impact', icon: <Assessment /> },
          { text: 'Conservation', path: '/blue-carbon/conservation', icon: <Security /> },
        ]
      },
      {
        text: 'Analytics',
        icon: <Analytics />,
        path: '/analytics',
        children: [
          { text: 'Overview', path: '/analytics/overview', icon: <Dashboard /> },
          { text: 'Economic Impact', path: '/analytics/economic', icon: <TrendingUp /> },
          { text: 'Reports', path: '/analytics/reports', icon: <Assessment /> },
        ]
      },
      {
        text: 'Locations',
        icon: <LocationOn />,
        path: '/locations',
      },
    ];

    // Add role-specific items
    const roleSpecificItems = [];
    
    if (user?.role === 'disaster_management') {
      roleSpecificItems.push({
        text: 'Emergency Response',
        icon: <Security />,
        path: '/emergency',
        badge: { count: 3, color: 'error' },
      });
    }

    if (user?.role === 'environmental_ngo') {
      roleSpecificItems.push({
        text: 'Conservation Projects',
        icon: <Nature />,
        path: '/conservation',
      });
    }

    if (['disaster_management', 'civil_defence'].includes(user?.role)) {
      roleSpecificItems.push({
        text: 'Coordination',
        icon: <People />,
        path: '/coordination',
      });
    }

    return [...baseItems, ...roleSpecificItems];
  };

  const navigationItems = getNavigationItems();

  const renderNavItem = (item, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.path];
    const paddingLeft = 16 + (depth * 16);

    return (
      <React.Fragment key={item.path}>
        <ListItemButton
          selected={isActive(item.path)}
          onClick={() => handleItemClick(item.path, hasChildren)}
          sx={{
            py: 1.5,
            pl: `${paddingLeft}px`,
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'primary.50',
              color: 'primary.700',
              '&:hover': {
                backgroundColor: 'primary.100',
              },
            },
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: isActive(item.path) ? 'primary.700' : 'text.secondary',
              minWidth: 40,
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{
              fontSize: '0.95rem',
              fontWeight: isActive(item.path) ? 600 : 500,
            }}
          />
          {item.badge && (
            <Chip
              label={item.badge.count}
              size="small"
              color={item.badge.color}
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          )}
          {hasChildren && (
            isExpanded ? <ExpandLess /> : <ExpandMore />
          )}
        </ListItemButton>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => renderNavItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, pt: 10 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Navigation
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor and protect coastal ecosystems
        </Typography>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Navigation Items */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List>
          {navigationItems.map((item) => renderNavItem(item))}
        </List>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={() => handleItemClick('/settings')}
          sx={{
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            primaryTypographyProps={{
              fontSize: '0.95rem',
              fontWeight: 500,
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export { DRAWER_WIDTH };
export default Sidebar;
