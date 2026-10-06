"use client";

import { forwardRef } from "react";
import type { Icon, IconProps } from "iconsax-react";
import {
  Activity as SaxActivity,
  Add as SaxAdd,
  ArrowDown as SaxArrowDown,
  ArrowDown2 as SaxArrowDown2,
  ArrowRight as SaxArrowRight,
  ArrowRight2 as SaxArrowRight2,
  ArrowSwapHorizontal as SaxArrowSwapHorizontal,
  ArrowUp as SaxArrowUp,
  Book1 as SaxBook1,
  Box as SaxBox,
  Call as SaxCall,
  Card as SaxCard,
  Category as SaxCategory,
  Chart as SaxChart,
  ClipboardText as SaxClipboardText,
  Clock as SaxClock,
  CloseCircle as SaxCloseCircle,
  Copy as SaxCopy,
  Designtools as SaxDesigntools,
  DocumentDownload as SaxDocumentDownload,
  DocumentText as SaxDocumentText,
  DocumentUpload as SaxDocumentUpload,
  DollarCircle as SaxDollarCircle,
  Edit2 as SaxEdit2,
  Eye as SaxEye,
  EyeSlash as SaxEyeSlash,
  Filter as SaxFilter,
  Flash as SaxFlash,
  Forbidden2 as SaxForbidden2,
  Headphone as SaxHeadphone,
  Heart as SaxHeart,
  Home2 as SaxHome2,
  Key as SaxKey,
  Lifebuoy as SaxLifebuoy,
  Location as SaxLocation,
  Lock as SaxLock,
  Login as SaxLogin,
  Logout as SaxLogout,
  MagicStar as SaxMagicStar,
  MessageQuestion as SaxMessageQuestion,
  MessageText as SaxMessageText,
  Mobile as SaxMobile,
  More as SaxMore,
  Notification as SaxNotification,
  People as SaxPeople,
  ReceiptText as SaxReceiptText,
  Refresh as SaxRefresh,
  SearchNormal1 as SaxSearchNormal1,
  Send2 as SaxSend2,
  Setting2 as SaxSetting2,
  ShieldCross as SaxShieldCross,
  ShieldTick as SaxShieldTick,
  Shop as SaxShop,
  ShoppingCart as SaxShoppingCart,
  Sms as SaxSms,
  Star1 as SaxStar1,
  TickCircle as SaxTickCircle,
  Trash as SaxTrash,
  TrendDown as SaxTrendDown,
  TrendUp as SaxTrendUp,
  User as SaxUser,
  Verify as SaxVerify,
  VolumeHigh as SaxVolumeHigh,
  Wallet as SaxWallet,
} from "iconsax-react";

// Explicit defaults keep Iconsax visible with React 19 and inherit UI colors.
function createIcon(Component: Icon, name: string) {
  const StyledIcon = forwardRef<SVGSVGElement, IconProps>(function StyledIcon(
    { color = "currentColor", size = 24, variant = "Bulk", className = "", ...props }, ref
  ) {
    return <Component {...props} ref={ref} color={color} size={size} variant={variant} className={`shrink-0 ${className}`} />;
  });
  StyledIcon.displayName = name;
  return StyledIcon;
}

export type WorkspaceIcon = ReturnType<typeof createIcon>;

export const Activity = createIcon(SaxActivity, "Activity");
export const ArrowDown = createIcon(SaxArrowDown, "ArrowDown");
export const ArrowUp = createIcon(SaxArrowUp, "ArrowUp");
export const BadgeCheck = createIcon(SaxVerify, "BadgeCheck");
export const Ban = createIcon(SaxForbidden2, "Ban");
export const Bell = createIcon(SaxNotification, "Bell");
export const BookOpen = createIcon(SaxBook1, "BookOpen");
export const ChartNoAxesColumn = createIcon(SaxChart, "ChartNoAxesColumn");
export const Check = createIcon(SaxTickCircle, "Check");
export const ChevronDown = createIcon(SaxArrowDown2, "ChevronDown");
export const ChevronRight = createIcon(SaxArrowRight2, "ChevronRight");
export const CircleHelp = createIcon(SaxMessageQuestion, "CircleHelp");
export const ClipboardList = createIcon(SaxClipboardText, "ClipboardList");
export const Clock = createIcon(SaxClock, "Clock");
export const Copy = createIcon(SaxCopy, "Copy");
export const CreditCard = createIcon(SaxCard, "CreditCard");
export const DollarSign = createIcon(SaxDollarCircle, "DollarSign");
export const Download = createIcon(SaxDocumentDownload, "Download");
export const Eye = createIcon(SaxEye, "Eye");
export const EyeOff = createIcon(SaxEyeSlash, "EyeOff");
export const FileText = createIcon(SaxDocumentText, "FileText");
export const Hammer = createIcon(SaxDesigntools, "Hammer");
export const Headphones = createIcon(SaxHeadphone, "Headphones");
export const HeadphonesIcon = createIcon(SaxHeadphone, "HeadphonesIcon");
export const Heart = createIcon(SaxHeart, "Heart");
export const House = createIcon(SaxHome2, "House");
export const KeyRound = createIcon(SaxKey, "KeyRound");
export const LayoutGrid = createIcon(SaxCategory, "LayoutGrid");
export const LifeBuoy = createIcon(SaxLifebuoy, "LifeBuoy");
export const ListFilter = createIcon(SaxFilter, "ListFilter");
export const Lock = createIcon(SaxLock, "Lock");
export const LogIn = createIcon(SaxLogin, "LogIn");
export const LogOut = createIcon(SaxLogout, "LogOut");
export const Mail = createIcon(SaxSms, "Mail");
export const MapPin = createIcon(SaxLocation, "MapPin");
export const Megaphone = createIcon(SaxVolumeHigh, "Megaphone");
export const MessageSquare = createIcon(SaxMessageText, "MessageSquare");
export const MoreHorizontal = createIcon(SaxMore, "MoreHorizontal");
export const Package = createIcon(SaxBox, "Package");
export const Pencil = createIcon(SaxEdit2, "Pencil");
export const Phone = createIcon(SaxCall, "Phone");
export const Plus = createIcon(SaxAdd, "Plus");
export const RefreshCw = createIcon(SaxRefresh, "RefreshCw");
export const Save = createIcon(SaxDocumentUpload, "Save");
export const ScrollText = createIcon(SaxReceiptText, "ScrollText");
export const Search = createIcon(SaxSearchNormal1, "Search");
export const Send = createIcon(SaxSend2, "Send");
export const Settings = createIcon(SaxSetting2, "Settings");
export const ShieldAlert = createIcon(SaxShieldCross, "ShieldAlert");
export const ShieldCheck = createIcon(SaxShieldTick, "ShieldCheck");
export const ShoppingCart = createIcon(SaxShoppingCart, "ShoppingCart");
export const Smartphone = createIcon(SaxMobile, "Smartphone");
export const Sparkles = createIcon(SaxMagicStar, "Sparkles");
export const Star = createIcon(SaxStar1, "Star");
export const Store = createIcon(SaxShop, "Store");
export const Trash2 = createIcon(SaxTrash, "Trash2");
export const TrendingDown = createIcon(SaxTrendDown, "TrendingDown");
export const TrendingUp = createIcon(SaxTrendUp, "TrendingUp");
export const User = createIcon(SaxUser, "User");
export const Users = createIcon(SaxPeople, "Users");
export const Wallet = createIcon(SaxWallet, "Wallet");
export const Wrench = createIcon(SaxSetting2, "Wrench");
export const X = createIcon(SaxCloseCircle, "X");
export const Zap = createIcon(SaxFlash, "Zap");
export const Shop = createIcon(SaxShop, "Shop");
export const Setting2 = createIcon(SaxSetting2, "Setting2");
export const ArrowRight = createIcon(SaxArrowRight, "ArrowRight");
export const Logout = createIcon(SaxLogout, "Logout");
export const ShieldTick = createIcon(SaxShieldTick, "ShieldTick");
export const People = createIcon(SaxPeople, "People");
export const Headphone = createIcon(SaxHeadphone, "Headphone");
export const ReceiptText = createIcon(SaxReceiptText, "ReceiptText");
export const ArrowSwapHorizontal = createIcon(SaxArrowSwapHorizontal, "ArrowSwapHorizontal");
export const Home2 = createIcon(SaxHome2, "Home2");
