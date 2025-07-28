// Optimized icon imports to reduce bundle size
// Only import the specific icons you need

// Lucide React icons (tree-shakable)
export {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Building,
  MapPin,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  Search,
  Settings,
  LogOut,
  Home,
  Users,
  Package,
  BarChart3,
  Bell,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink,
  Copy,
  Share,
  MoreVertical,
  MoreHorizontal,
} from "lucide-react";

// Radix UI icons (tree-shakable)
export {
  MoonIcon,
  SunIcon,
  DesktopIcon,
  CheckIcon,
  Cross2Icon,
  CaretSortIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";

// Type for icon components
export type IconComponent = React.ComponentType<{
  className?: string;
  size?: number | string;
}>;

// Icon size constants
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export type IconSize = keyof typeof ICON_SIZES;
