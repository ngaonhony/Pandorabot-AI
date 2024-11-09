import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUserProfile, getOrderHistory, getUserWishlist } from '../services/api/userService';

// Định nghĩa các giao diện nếu chưa được định nghĩa
interface Image {
  public_id: string;
  url: string;
  _id: string;
}

interface Rating {
  star: number;
  comment: string;
  postedby: string;
  _id: string;
}

interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  quantity: number;
  sold: number;
  images: Image[];
  color: string[];
  tags: string;
  totalrating: number;
  ratings: Rating[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface WishlistItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  quantity: number;
  sold: number;
  images: Image[];
  color: string[];
  tags: string;
  totalrating: number;
  ratings: Rating[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface UserData {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  mobile: string;
  password: string;
  role: string;
  isBlocked: boolean;
  cart: any[]; // Bạn có thể định nghĩa chi tiết hơn nếu cần
  wishlist: WishlistItem[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  refreshToken: string;
}

interface UserState {
  userData: UserData | null;
  wishlist: WishlistItem[];
  loading: boolean;
  error: string | null;
}

// **Định nghĩa initialState**
const initialState: UserState = {
  userData: null,
  wishlist: [],
  loading: false,
  error: null,
};

// Async thunk để cập nhật hồ sơ người dùng
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (updatedData: Partial<UserData>, { rejectWithValue }) => {
    try {
      const response = await updateUserProfile(updatedData);
      const updatedUser: UserData = response.data;

      // Cập nhật AsyncStorage
      const token = (await AsyncStorage.getItem('token')) || '';
      await AsyncStorage.setItem('customer', JSON.stringify(updatedUser));

      return { token, userData: updatedUser };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

// Async thunk để lấy lịch sử đơn hàng
export const fetchOrderHistory = createAsyncThunk(
  'user/fetchOrderHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getOrderHistory();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order history');
    }
  }
);

// Async thunk để lấy wishlist người dùng
export const fetchUserWishlist = createAsyncThunk(
  'user/fetchUserWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserWishlist();
      // Giả sử response.data là object user với thuộc tính wishlist
      return response.data.wishlist;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState, // Sử dụng initialState đã định nghĩa
  reducers: {
    // Định nghĩa các hành động đồng bộ nếu cần
    setUserData(state, action: PayloadAction<UserData>) {
      state.userData = action.payload;
      state.wishlist = action.payload.wishlist;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý pending
      .addCase(fetchUserWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Xử lý fulfilled
      .addCase(fetchUserWishlist.fulfilled, (state, action: PayloadAction<WishlistItem[]>) => {
        state.wishlist = action.payload;
        state.loading = false;
      })
      // Xử lý rejected
      .addCase(fetchUserWishlist.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch wishlist';
      });
  },
});

export const { setUserData } = userSlice.actions;

export default userSlice.reducer;