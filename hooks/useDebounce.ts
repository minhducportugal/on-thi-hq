// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

// T: Kiểu dữ liệu của giá trị
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 1. Thiết lập timer để cập nhật giá trị sau 'delay' ms
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 2. Clear timer nếu giá trị 'value' thay đổi (người dùng gõ tiếp)
    // hoặc nếu component bị unmount.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Chạy lại khi 'value' hoặc 'delay' thay đổi

  return debouncedValue;
}