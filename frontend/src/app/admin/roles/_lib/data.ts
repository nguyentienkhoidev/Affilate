export interface RoleItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  usersCount: number;
  permissions: string[];
}

export interface PermissionGroup {
  module: string;
  isCore?: boolean;
  description?: string;
  permissions: {
    code: string;
    label: string;
    description: string;
    isLocked?: boolean;
  }[];
}

export const ROLES_STORE_KEY = 'roles';

export const CORE_PERMISSION_CODES: string[] = [
  'backend.access',
  'user.2fa_self',
  'file.upload',
];

export const isCorePermission = (code: string): boolean => {
  return CORE_PERMISSION_CODES.includes(code);
};

export const PERMISSION_CATALOG: PermissionGroup[] = [
  {
    module: 'Core System Privileges (Mandatory)',
    isCore: true,
    description: 'Minimum baseline permissions granted to all roles by default and locked against modification.',
    permissions: [
      {
        code: 'backend.access',
        label: 'Access Admin ProCMS',
        description: 'Sign in to the admin console and access core workspace features',
        isLocked: true,
      },
      {
        code: 'user.2fa_self',
        label: 'Personal Profile & 2FA',
        description: 'View own account profile, change password, and manage two-factor authentication',
        isLocked: true,
      },
      {
        code: 'file.upload',
        label: 'Media Library & Upload',
        description: 'Open the shared Media Library to browse and upload images while editing',
        isLocked: true,
      },
    ],
  },
  {
    module: 'Stores Directory Management',
    permissions: [
      { code: 'store.view', label: 'View Stores', description: 'Browse and inspect partner merchant profiles' },
      { code: 'store.create', label: 'Create Stores', description: 'Add new merchant brands and affiliate domain links' },
      { code: 'store.update', label: 'Update Stores', description: 'Edit store logos, star ratings, and merchant descriptions' },
      { code: 'store.delete', label: 'Delete Stores', description: 'Archive or remove merchants from the store directory' },
      { code: 'store.affiliate_intel', label: 'Commission & Affiliate Intel', description: 'View affiliate commission rates and direct manager contacts' },
      { code: 'store.ads_assign', label: 'Assign Ads Operations', description: 'Assign dedicated advertising managers to stores' },
    ],
  },
  {
    module: 'Coupons & Deals Management',
    permissions: [
      { code: 'offer.view', label: 'View Offers', description: 'Browse coupon vouchers and promotional deals' },
      { code: 'offer.create', label: 'Create Offers', description: 'Add new promo codes or promotional campaigns' },
      { code: 'offer.update', label: 'Update Offers', description: 'Modify discount amounts, expiration dates, and terms' },
      { code: 'offer.delete', label: 'Delete Offers', description: 'Remove expired or invalid coupons' },
      { code: 'offer.verify', label: 'Verify Offers', description: 'Mark tested promo codes as verified today' },
      { code: 'offer.clone', label: 'Clone Offers', description: 'Duplicate existing coupons with a single click' },
    ],
  },
  {
    module: 'Articles & Reviews Management',
    permissions: [
      { code: 'post.view', label: 'View Articles', description: 'Read product review drafts and buying guides' },
      { code: 'post.create', label: 'Create Articles', description: 'Compose reviews, deal boxes, and pros/cons tables' },
      { code: 'post.update', label: 'Update Articles', description: 'Edit article content, sidebar config, and lab benchmark scores' },
      { code: 'post.delete', label: 'Delete Articles', description: 'Archive or permanently delete review articles' },
      { code: 'post.publish', label: 'Publish & Schedule', description: 'Publish articles live or schedule future release times' },
      { code: 'post.clone', label: 'Clone Articles', description: 'Duplicate an article as a draft for re-editing' },
    ],
  },
  {
    module: 'Categories & Taxonomy',
    permissions: [
      { code: 'category.view', label: 'View Categories', description: 'View editorial taxonomy and category hierarchy' },
      { code: 'category.create', label: 'Create Category', description: 'Add new shopping categories and parent hierarchy' },
      { code: 'category.update', label: 'Update Category', description: 'Modify category names, icons, descriptions, and slugs' },
      { code: 'category.delete', label: 'Delete Category', description: 'Delete empty or unused taxonomy categories' },
    ],
  },
  {
    module: 'Navigation Menus',
    permissions: [
      { code: 'menu.manage', label: 'Manage Navigation Menus', description: 'Configure header, footer, and mobile portal navigation menus' },
    ],
  },
  {
    module: 'Static & Policy Pages',
    permissions: [
      { code: 'page.view', label: 'View Static Pages', description: 'Inspect published legal policies, terms, and informational pages' },
      { code: 'page.create', label: 'Create Static Page', description: 'Create new legal and disclosure pages' },
      { code: 'page.update', label: 'Update Static Page', description: 'Edit policy page content and SEO metadata' },
      { code: 'page.delete', label: 'Delete Static Page', description: 'Remove deprecated policy or informational pages' },
    ],
  },
  {
    module: 'Customer Inquiries & Feedback',
    permissions: [
      { code: 'feedback.view', label: 'View Customer Inquiries', description: 'View and respond to reader coupon feedback and inquiries' },
      { code: 'feedback.delete', label: 'Delete Inquiries', description: 'Remove resolved or spam customer messages' },
    ],
  },
  {
    module: 'Media Assets & Storage',
    permissions: [
      { code: 'file.upload', label: 'Upload Media Files', description: 'Upload images, banners, and logos to MinIO object storage' },
      { code: 'file.delete', label: 'Delete Media Files', description: 'Permanently remove images and files from object storage' },
    ],
  },
  {
    module: 'Staff Accounts & Identity',
    permissions: [
      { code: 'user.view', label: 'View Staff Accounts', description: 'Browse staff accounts and assigned roles' },
      { code: 'user.create', label: 'Create Staff Accounts', description: 'Provision new backoffice accounts for team members' },
      { code: 'user.update', label: 'Update Staff Accounts', description: 'Change staff roles, email addresses, or account status' },
      { code: 'user.delete', label: 'Delete Staff Accounts', description: 'Deactivate or soft-delete staff user accounts' },
      { code: 'user.2fa_self', label: 'Manage Own 2FA', description: 'Configure and test own two-factor authentication' },
      { code: 'user.2fa_reset', label: 'Emergency 2FA Reset', description: 'Reset 2FA when a staff member loses their authenticator device' },
    ],
  },
  {
    module: 'Roles & RBAC Matrix',
    permissions: [
      { code: 'role.view', label: 'View Roles & Matrix', description: 'Inspect role definitions and detailed permission mappings' },
      { code: 'role.create', label: 'Create Custom Roles', description: 'Define new roles with tailored privilege profiles' },
      { code: 'role.update', label: 'Update Role Permissions', description: 'Modify granular module permissions on operational roles' },
      { code: 'role.delete', label: 'Delete Custom Roles', description: 'Remove custom roles not currently assigned to active staff' },
    ],
  },
  {
    module: 'System Settings & SEO',
    permissions: [
      { code: 'setting.general', label: 'General Configuration', description: 'Update site identity, brand name, slogan, and logos' },
      { code: 'setting.seo', label: 'SEO & Verification Meta', description: 'Configure PartnerBoost, Impact, and Google Search Console tags' },
      { code: 'setting.tracking', label: 'Tracking & Analytics', description: 'Manage Google Tag Manager and Google Analytics IDs' },
      { code: 'setting.social', label: 'Social Media Profiles', description: 'Manage brand social channel links and OpenGraph assets' },
      { code: 'setting.ads', label: 'Monetization & Ad Banners', description: 'Manage sponsored banners and advertising placements' },
    ],
  },
];
