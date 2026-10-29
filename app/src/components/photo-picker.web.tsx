import { useRef } from 'react';

import { Button } from '@/components/form';

type PhotoPickerProps = { label: string; onPick: (files: File[]) => void };

export function PhotoPicker({ label, onPick }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          onPick(Array.from(event.target.files ?? []));
          event.target.value = '';
        }}
      />
      <Button secondary label={label} onPress={() => inputRef.current?.click()} />
    </>
  );
}
