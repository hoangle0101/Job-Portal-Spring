import { useEffect, useRef } from 'react';

// Gọi onOutsideClick khi người dùng bấm ra ngoài phần tử được gắn ref (dùng để đóng menu thả xuống)
export default function useClickOutside(onOutsideClick) {
  const ref = useRef(null);

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideClick();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onOutsideClick]);

  return ref;
}
