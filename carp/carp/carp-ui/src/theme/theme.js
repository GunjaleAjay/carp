import { createTheme } from '@mui/material/styles';

// Eco-friendly color palette
const ecoColors = {
  primary: {
    main: '#059669',
    light: '#10b981',
    dark: '#047857',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#84cc16',
    light: '#a3e635',
    dark: '#65a30d',
    contrastText: '#ffffff',
  },
  earth: {
    main: '#92400e',
    light: '#fbbf24',
    dark: '#78350f',
    contrastText: '#ffffff',
  },
  sky: {
    main: '#0ea5e9',
    light: '#38bdf8',
    dark: '#0284c7',
    contrastText: '#ffffff',
  },
  eco: {
    green: '#059669',
    lightGreen: '#10b981',
    darkGreen: '#047857',
    secondaryGreen: '#84cc16',
    earthBrown: '#92400e',
    earthTan: '#fbbf24',
    skyBlue: '#0ea5e9',
    lightSky: '#38bdf8',
  },
};

const themeOptions = {
  palette: {
    mode: 'light',
    primary: ecoColors.primary,
    secondary: ecoColors.secondary,
    error: {
      main: '#dc2626',
    },
    warning: {
      main: '#d97706',
    },
    info: {
      main: ecoColors.sky.main,
    },
    success: {
      main: ecoColors.primary.main,
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
    divider: '#e5e7eb',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.3s ease-in-out',
        },
        contained: {
          background: `linear-gradient(135deg, ${ecoColors.primary.main} 0%, ${ecoColors.secondary.main} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${ecoColors.primary.dark} 0%, ${ecoColors.secondary.dark} 100%)`,
          },
        },
        outlined: {
          borderColor: ecoColors.primary.main,
          color: ecoColors.primary.main,
          '&:hover': {
            backgroundColor: ecoColors.primary.main,
            color: '#ffffff',
          },
        },
        text: {
          color: ecoColors.primary.main,
          '&:hover': {
            backgroundColor: `${ecoColors.primary.main}10`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: ecoColors.primary.main,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: ecoColors.primary.main,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: `${ecoColors.primary.main}15`,
          color: ecoColors.primary.main,
          '&:hover': {
            backgroundColor: `${ecoColors.primary.main}25`,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1f2937',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: `${ecoColors.primary.main}15`,
            color: ecoColors.primary.main,
            '&:hover': {
              backgroundColor: `${ecoColors.primary.main}20`,
            },
          },
          '&:hover': {
            backgroundColor: `${ecoColors.primary.main}08`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: '#e5e7eb',
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: `${ecoColors.primary.main} #f3f4f6`,
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 3,
            backgroundColor: ecoColors.primary.main,
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            borderRadius: 3,
            backgroundColor: '#f3f4f6',
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
};

const theme = createTheme(themeOptions);

export default theme;
export { ecoColors };
