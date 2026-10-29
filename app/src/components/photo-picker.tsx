type PhotoPickerProps = { label: string; onPick: (files: File[]) => void };

// Native photo picking comes with the native build; web uses a file input.
export function PhotoPicker(_props: PhotoPickerProps) {
  return null;
}
