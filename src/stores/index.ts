import { create } from 'zustand';

//================== types ==================//
export type UserState = {
    userDetails: iUser | null;
    setUserDetails: (details: iUser | null) => void;
};

export type FeaturesState = {
    features: iFeature[];
    setFeatures: (features: iFeature[]) => void;
};

export type ProductsState = {
    products: iProduct[];
    setProducts: (products: iProduct[]) => void;
};

//================== store ==================//
export const useUserState = create<UserState>((set) => ({
    userDetails: null,
    setUserDetails: (details: iUser | null) => set({ userDetails: details }),
}));

export const useFeaturesState = create<FeaturesState>((set) => ({
    features: [],
    setFeatures: (features: iFeature[]) => set({ features }),
}));

export const useProductsState = create<ProductsState>((set) => ({
    products: [],
    setProducts: (products: iProduct[]) => set({ products }),
}));

export const useQuotesState = create<{ quotes: iQuote[]; setQuotes: (quotes: iQuote[]) => void }>((set) => ({
    quotes: [],
    setQuotes: (quotes: iQuote[]) => set({ quotes }),
}));