let navigator;

export const NavigationService = {
  setNavigator: (navigatorRef) => {
    navigator = navigatorRef;
  },

  navigate: (routeName, params) => {
    if (navigator) {
      navigator.navigate(routeName, params);
    } else {
      console.warn('Navigator not set yet');
    }
  },

  goBack: () => {
    if (navigator) {
      navigator.goBack();
    }
  },

  reset: (routeName) => {
    if (navigator) {
      navigator.reset({
        index: 0,
        routes: [{ name: routeName }],
      });
    }
  }
};