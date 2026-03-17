import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

//-> Auth Stack
export type AuthStackParamList = {
  Login:         undefined;
  CompanySelect: undefined;
}

//-> Main Tabs
export type MainTabParamList = {
  Inventory:  undefined;
  Documents:  undefined;
  Profile:    undefined;
};
//-> Screen Props
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;
export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<MainTabParamList, T>;