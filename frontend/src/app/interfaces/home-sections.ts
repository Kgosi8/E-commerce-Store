export interface Showcase {
  key:            string;   // unique id for the section
  tag:            string;   // product tag to fetch, must match the tag saved on products
  rowTitle:       string;   // heading above the scroll row
  bannerId?:      string;   // Cloudinary public ID of a model banner (optional)
  bannerEyebrow?: string;
  bannerTitle?:   string;
  bannerAlt?:     string;
}

// Sections render top to bottom in this order. Reorder by moving objects.
// Add `bannerId` (plus the banner fields) to any section to give it a model banner.
export const HOME_SECTIONS: Showcase[] = [
  {
    key:      'tshirts',
    tag:      'T-Shirts',
    rowTitle: 'T-Shirts',
    bannerId: 'models/models-1',    
    bannerEyebrow: 'Classic & Comfortable',
    bannerTitle:   'T-Shirts',
    bannerAlt:     'Model wearing a Mpahlas t-shirt',
  },
  {
    key:      'hoodies',
    tag:      'Hoodies',
    rowTitle: 'Hoodies',
    bannerId: 'models/hoodies-model',     // TODO: your real public ID
    bannerEyebrow: 'Stay Warm & Stylish',
    bannerTitle:   'Hoodies',
    bannerAlt:     'Model wearing a Mpahlas hoodie',
  },
  {
    key:      'pants',
    tag:      'Pants',
    rowTitle: 'Pants',
    bannerId: 'models/pants-model',     // TODO: your real public ID
    bannerEyebrow: 'Comfortable & Stylish',
    bannerTitle:   'Pants',
    bannerAlt:     'Model wearing Mpahlas pants',
  },
  {
    key:           'caps',
    tag:           'Caps',
    rowTitle:      'Caps',
    bannerId:      'model-cap',     // TODO: your real public ID
    bannerEyebrow: 'Finish the look',
    bannerTitle:   'Caps',
    bannerAlt:     'Model wearing a Mpahlas cap',
  },
  {
    key:      'beanies',
    tag:      'Beanies',
    rowTitle: 'Beanies',
    bannerId: 'models/beanies-model',     // TODO: your real public ID
    bannerEyebrow: 'Winter is coming',
    bannerTitle:   'Beanies',
    bannerAlt:     'Model wearing a Mpahlas beanie',
  },
  {
    key:           'kids',
    tag:           'Kids',
    rowTitle:      'Kids',
    bannerId:      'products/kptw1lqxhh9lxbfwjzy3',     // TODO: your real public ID
    bannerEyebrow: 'Mini Mpahlas',
    bannerTitle:   'Kids',
    bannerAlt:     'Kid wearing Mpahlas clothing',
  },
  {
    key:      'slutchi',
    tag:      'Slutchi',
    rowTitle: 'Slutchi',
    bannerId: 'Model-Hoodie_Sluchie',     // TODO: your real public ID
    bannerEyebrow: 'Stylish & Comfortable',
    bannerTitle:   'Slutchi',
    bannerAlt:     'Model wearing Mpahlas Slutchi',
  },
];