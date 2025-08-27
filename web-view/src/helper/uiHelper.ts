export function getColumnSizes(itemCount: number) {
  if (itemCount === 1) {
    return { xs: 12, sm: 12, md: 8, lg: 6, xl: 4 };
  } else if (itemCount === 2) {
    return { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 };
  } else if (itemCount === 3) {
    return { xs: 12, sm: 6, md: 4, lg: 4, xl: 4 };
  } else {
    return { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 };
  }
}
