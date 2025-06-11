import { createTheme } from '@mui/material/styles';

// Common properties for both themes
const commonProperties = {
  typography: {
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: 1.3,
      marginBottom: '16px',
      textShadow: '0px 1px 2px rgba(0,0,0,0.1)',
    },
    h2: {
      fontSize: '20px',
      fontWeight: 500,
      lineHeight: 1.4,
      marginBottom: '12px',
      textShadow: '0px 1px 2px rgba(0,0,0,0.08)',
    },
    h3: {
      fontSize: '18px',
      fontWeight: 500,
      lineHeight: 1.5,
      marginBottom: '8px',
      textShadow: '0px 1px 1px rgba(0,0,0,0.06)',
    },
    body1: {

      fontSize: '16px',
      fontWeight: 400,
    },
    body2: {
      fontSize: '14px',
      fontWeight: 400,
      color: '#546E7A', // Specific to light, will be overridden in dark
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
    },
    overline: {
      fontSize: '12px',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: { // Common component overrides
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 4px 10px rgba(0,0,0,0.06), 0px 1px 3px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0px 6px 15px rgba(0,0,0,0.08), 0px 2px 5px rgba(0,0,0,0.05)',
          },
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
          boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 2px 5px rgba(0,0,0,0.1)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            boxShadow: '0px 1px 1px rgba(0,0,0,0.03)',
            transform: 'translateY(0)',
          },
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)', // Standard MUI hover
            transform: 'translateY(-1px)',
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            transition: 'box-shadow 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0px 1px 3px rgba(0,0,0,0.04)',
            },
            '&.Mui-focused': {
              boxShadow: '0px 2px 6px rgba(0,0,0,0.06)',
            },
          },
        }
      }
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 3px 8px rgba(0,0,0,0.05), 0px 1px 2px rgba(0,0,0,0.03)',
        }
      }
    },
    MuiTableRow: {

      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)', // Subtle hover for table rows
          }
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(0, 0, 0, 0.12)', // divider
          boxShadow: '3px 0px 8px rgba(0,0,0,0.05)',
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 6px rgba(0,0,0,0.07), 0px 1px 4px rgba(0,0,0,0.04)', 
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          padding: '8px',
          boxShadow: '0px 6px 20px rgba(0,0,0,0.1), 0px 3px 8px rgba(0,0,0,0.06)',
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '24px 24px 16px',
          '& .MuiTypography-root': {
            fontSize: '20px',
            fontWeight: 500,
            textShadow: '0px 1px 2px rgba(0,0,0,0.08)',
          }
        }
      }
    },
    MuiDialogContent: {

      styleOverrides: {
        root: {
          padding: '0 24px 24px',
        }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px',
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        button: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            transform: 'translateX(2px)',
          }
        }
      }
    },
    MuiListItemIcon: {

      styleOverrides: {
        root: {
          minWidth: '40px',
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: `
        body {
          scrollbar-width: thin;
        }
      `,
    },
  }
};

// Light theme
export const lightTheme = createTheme({
  ...commonProperties,
  palette: {
    mode: 'light',
    primary: {
      main: '#607D8B',
      light: '#CFD8DC',
      dark: '#455A64',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#81C784',
      light: '#A5D6A7',
      dark: '#558B2F',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#ECEFF1',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#263238',
      secondary: '#546E7A',
      disabled: '#90A4AE',
    },
    error: {
      main: '#FFB3B3', // Pastel Red
      light: '#FFD6D6',
      dark: '#FF8080',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FFB74D', // More vivid Orange
      light: '#FFD180', // Lighter shade for warning
      dark: '#FFA726',  // Darker shade for warning
      contrastText: '#FFFFFF', // White text should still be fine
    },
    info: {
      main: '#90CAF9', // More vivid Blue
      light: '#BBDEFB', // Lighter shade for info
      dark: '#64B5F6',  // Darker shade for info
      contrastText: '#FFFFFF', // White text should still be fine
    },
    success: {
      main: '#9CCC65', // More vivid Green
      light: '#C5E1A5', // Lighter shade for success
      dark: '#7CB342',  // Darker shade for success
      contrastText: '#FFFFFF', // White text should still be fine
    },
    divider: 'rgba(0, 0, 0, 0.12)',

  },
  components: {
    ...commonProperties.components, // Spread common component styles
    MuiPaper: { 
      styleOverrides: {
        root: {
          ...commonProperties.components?.MuiPaper?.styleOverrides?.root, 
          boxShadow: '0px 4px 10px rgba(0,0,0,0.06), 0px 1px 3px rgba(0,0,0,0.04)', // Enhanced light theme shadow
        },
        elevation1: {
          ...commonProperties.components?.MuiPaper?.styleOverrides?.elevation1,
          boxShadow: '0px 2px 6px rgba(0,0,0,0.05), 0px 1px 2px rgba(0,0,0,0.03)', // Enhanced light theme elevation1 shadow
        }
      }
    },
    MuiTableHead: {

      styleOverrides: {
        root: {
          ...commonProperties.components?.MuiTableHead?.styleOverrides?.root,
          backgroundColor: '#CFD8DC', // primary.light
          '& .MuiTableCell-head': {
            color: '#263238', // text.primary
            fontWeight: 'bold',
          }
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          ...commonProperties.components?.MuiDrawer?.styleOverrides?.paper,
          backgroundColor: '#FFFFFF', // background.paper
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          ...commonProperties.components?.MuiAppBar?.styleOverrides?.root,
          backgroundColor: '#FFFFFF', // background.paper
          color: '#263238', // text.primary
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          ...commonProperties.components?.MuiListItemIcon?.styleOverrides?.root,
          color: '#607D8B', // primary.main for icons
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: `
        ${commonProperties.components.MuiCssBaseline.styleOverrides}
        body {
          scrollbar-color: #CFD8DC #ECEFF1; /* thumb track */
        }
        body::-webkit-scrollbar {
          width: 8px;
        }
        body::-webkit-scrollbar-track {
          background: #ECEFF1;
        }
        body::-webkit-scrollbar-thumb {
          background-color: #CFD8DC;
          border-radius: 10px;
          border: 2px solid #ECEFF1;
        }
      `,
    },
    MuiButton: { // Example of extending common button styles for light theme if needed
      styleOverrides: {
        ...commonProperties.components.MuiButton.styleOverrides, // Spread common button styles
        outlinedPrimary: { // Light theme specific
          ...commonProperties.components.MuiButton.styleOverrides.outlinedPrimary,
          borderColor: '#607D8B', // primary.main
           '&:hover': {
              backgroundColor: 'rgba(96, 125, 139, 0.04)', // Light primary background on hover
              borderColor: '#455A64', // primary.dark
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          ...commonProperties.components.MuiTextField.styleOverrides.root,
          '& .MuiOutlinedInput-root': {
            ...commonProperties.components.MuiTextField.styleOverrides.root['& .MuiOutlinedInput-root'],
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#607D8B', // primary.main
            },
          },
          '& .MuiInputLabel-outlined': {
            color: '#546E7A', // text.secondary
          },
        }
      }
    }
  }
});

// Dark theme
export const darkTheme = createTheme({
  ...commonProperties,
  palette: {
    mode: 'dark',
    primary: { // Adjusted for dark mode visibility
      main: '#90A4AE', // Lighter Blue Grey
      light: '#CFD8DC',
      dark: '#607D8B',
      contrastText: '#000000', // Text on primary buttons
    },
    secondary: { // Can remain similar if contrast is good
      main: '#81C784',
      light: '#A5D6A7',
      dark: '#558B2F',
      contrastText: '#000000',
    },
    background: {
      default: '#121212', // Standard dark background
      paper: '#1E1E1E',   // Slightly lighter for paper elements
    },
    text: {
      primary: '#E0E0E0',   // Light grey for primary text
      secondary: '#B0BEC5', // Softer grey for secondary text
      disabled: '#757575',  // Muted grey for disabled
    },
    error: { // Pastel error, ensure good contrast on dark
      main: '#FF9999', // Softer red
      light: '#FFBDBD',
      dark: '#FF6666',
      contrastText: '#000000', // Ensure dark text on light error color in dark mode
    },
    warning: { // Pastel warning
      main: '#FFD180', // Softer orange
      light: '#FFE0B2',
      dark: '#FFAB40',
      contrastText: '#000000', // Ensure dark text on light warning color in dark mode
    },
    info: { // Pastel info
      main: '#82B1FF', // Softer blue
      light: '#B6E3FF',
      dark: '#448AFF',
      contrastText: '#000000', // Ensure dark text on light info color in dark mode
    },
    success: { // Pastel success
      main: '#98CC99', // Softer green
      light: '#C8E6C9',
      dark: '#689F38',
      contrastText: '#000000', // Ensure dark text on light success color in dark mode
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  components: {
    ...commonProperties.components, // Spread common component styles
    MuiPaper: {
      styleOverrides: {
        root: {
          ...commonProperties.components?.MuiPaper?.styleOverrides?.root,
          boxShadow: '0px 4px 10px rgba(0,0,0,0.25), 0px 1px 3px rgba(0,0,0,0.15)', // Enhanced dark theme shadow
        },
        elevation1: {
          ...commonProperties.components?.MuiPaper?.styleOverrides?.elevation1,
          boxShadow: '0px 2px 6px rgba(0,0,0,0.2), 0px 1px 2px rgba(0,0,0,0.1)', // Enhanced dark theme elevation1 shadow
        }
      }
    },
    MuiTableHead: {

      styleOverrides: {
        root: {
          ...commonProperties.components?.MuiTableHead?.styleOverrides?.root,
          backgroundColor: '#CFD8DC', // Keep light background like in lightTheme (primary.light)
          '& .MuiTableCell-head': {
            color: '#263238', // Keep dark text like in lightTheme (text.primary)
            fontWeight: 'bold',
          }
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          ...commonProperties.components?.MuiDrawer?.styleOverrides?.paper,
          backgroundColor: '#1E1E1E', // paper dark
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          ...commonProperties.components?.MuiAppBar?.styleOverrides?.root,
          backgroundColor: '#1E1E1E', // paper dark
          color: '#E0E0E0', // text.primary dark
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          ...commonProperties.components?.MuiListItemIcon?.styleOverrides?.root,
          color: '#90A4AE', // primary.main dark for icons
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: `
        ${commonProperties.components.MuiCssBaseline.styleOverrides}
        body {
          scrollbar-color: #546E7A #121212; /* thumb track for dark mode */
        }
        body::-webkit-scrollbar {
          width: 8px;
        }
        body::-webkit-scrollbar-track {
          background: #121212;
        }
        body::-webkit-scrollbar-thumb {
          background-color: #546E7A;
          border-radius: 10px;
          border: 2px solid #121212;
        }
      `,
    },
    MuiButton: { // Example of extending common button styles for dark theme if needed
      styleOverrides: {
        ...commonProperties.components.MuiButton.styleOverrides, // Spread common button styles
        outlinedPrimary: { // Dark theme specific
          ...commonProperties.components.MuiButton.styleOverrides.outlinedPrimary,
          borderColor: '#90A4AE', // primary.main dark
           '&:hover': {
              backgroundColor: 'rgba(144, 164, 174, 0.08)', // Light primary background on hover
              borderColor: '#CFD8DC', // primary.light dark
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          ...commonProperties.components.MuiTextField.styleOverrides.root,
          '& .MuiOutlinedInput-root': {
            ...commonProperties.components.MuiTextField.styleOverrides.root['& .MuiOutlinedInput-root'],
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.23)', // Lighter border for dark mode
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#90A4AE', // primary.main dark
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#90A4AE', // primary.main dark
            },
          },
          '& .MuiInputLabel-outlined': {
            color: '#B0BEC5', // text.secondary dark
          },
          '& .MuiInputBase-input': {
            color: '#E0E0E0', // text.primary dark for input text
          }
        }
      }
    }
  }
});

// Default export can be lightTheme, or decided by the ThemeProvider later
export default lightTheme;
