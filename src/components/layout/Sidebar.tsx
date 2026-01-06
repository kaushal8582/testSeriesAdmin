'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  MenuBook as ExamIcon,
  Quiz as TestIcon,
  HelpOutline as QuestionIcon,
  Analytics as AnalyticsIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  CardMembership as SubscriptionIcon,
  LocalOffer as PromoCodeIcon,
  Share as ReferralIcon,
  Payment as PaymentIcon,
  Notifications as NotificationIcon,
  EmojiEvents as ChallengeIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/constants';
import { clearAuthData } from '@/utils/cookies';
import { Logo } from '../Logo';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: DashboardIcon, path: ROUTES.DASHBOARD },
  { text: 'Categories', icon: CategoryIcon, path: ROUTES.CATEGORIES },
  { text: 'Exams', icon: ExamIcon, path: ROUTES.EXAMS },
  { text: 'Tests', icon: TestIcon, path: ROUTES.TESTS },
  { text: 'Questions', icon: QuestionIcon, path: ROUTES.QUESTIONS },
  { text: 'Daily Challenges', icon: ChallengeIcon, path: ROUTES.DAILY_CHALLENGES },
  { text: 'Analytics', icon: AnalyticsIcon, path: ROUTES.ANALYTICS },
  { text: 'Users', icon: PeopleIcon, path: ROUTES.USERS },
  { text: 'Subscriptions', icon: SubscriptionIcon, path: ROUTES.SUBSCRIPTIONS },
  { text: 'Promo Codes', icon: PromoCodeIcon, path: ROUTES.PROMO_CODES },
  { text: 'Referrals', icon: ReferralIcon, path: ROUTES.REFERRALS },
  { text: 'Payments', icon: PaymentIcon, path: ROUTES.PAYMENTS },
  { text: 'Notifications', icon: NotificationIcon, path: ROUTES.NOTIFICATIONS },
];

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    clearAuthData();
    router.push(ROUTES.LOGIN);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar>
        <Logo size="small" showText={true} />
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={pathname === item.path}
                onClick={() => router.push(item.path)}
              >
                <ListItemIcon>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};
