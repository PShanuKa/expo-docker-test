import {
  TextInput,
  View,
  Text,
  KeyboardTypeOptions,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";


export default function Input({

  label,
  placeholder,
  keyboardType,
  value,
  onChangeText,
  icon,
  rightIcon,
  iconType,
  onRightIconPress,
  autoFocus,
  disabled,
}: {
  label: string;
  placeholder: string;
  keyboardType: KeyboardTypeOptions;
  value: string;
  onChangeText: (text: string) => void;
  icon: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  iconType?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}) {

 



  return (
    <View className="flex flex-col gap-1 h-[60px]">
      <Text className="text-black text-[11px] font-medium">{label}</Text>
      <View className="border border-primary rounded-[10px] flex flex-row items-center  justify-between p-1 gap-3 ">
        <View className="flex-1 flex-row items-center gap-3 ">

        <View
          className="w-[42px] h-[42px] bg-primary  rounded-[10px] items-center justify-center"
          style={{ height: 42 }}
        >
          {icon}
        </View>
        <TextInput
          
          autoFocus={autoFocus}
          placeholder={placeholder}
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
          className="bg-transparent   outline-none w-full"
          style={{ borderWidth: 0 }}
          editable={!disabled}
        />

           
          </View>
   
        {rightIcon && (
          <TouchableOpacity onPress={() => {
            if(iconType === "qr"){
              router.navigate("/scanner?type=lotqr");
            }else{
              onRightIconPress?.();
            }
          }}>
            <View
              className="w-[42px] h-[42px] rounded-[10px] items-center justify-center opacity-40"
              style={{ height: 42 }}
            >
              {rightIcon}
            </View>
          </TouchableOpacity>
        )}
      
      </View>
    </View>
  );
}
