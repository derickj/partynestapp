// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('partynestapp', ['ionic', 'ngCordova', 'partynestapp.controllers', 'partynestapp.services', 'lbServices'])

.run(function($ionicPlatform, $rootScope, $ionicLoading) {
    
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleDefault();
        }
    });
    
    $rootScope.$on('loading:show', function () {
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner> Loading ...'
        })
    });

    $rootScope.$on('loading:hide', function () {
        $ionicLoading.hide();
    });

    $rootScope.$on('$stateChangeStart', function () {
        console.log('Loading ...');
        $rootScope.$broadcast('loading:show');
    });

    $rootScope.$on('$stateChangeSuccess', function () {
        console.log('done');
        $rootScope.$broadcast('loading:hide');
    });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'IndexController'
      }
    }
  })

  .state('app.products', {
      url: '/products',
      views: {
        'menuContent': {
          templateUrl: 'templates/products.html',
          controller: 'ProductController'
        }
      }
    })
  
    .state('app.wishlist', {
      url: '/wishlist',
      cache:false,
      views: {
        'menuContent': {
          templateUrl: 'templates/wishlist.html',
            controller: 'WishlistController'
        }
      }
    })
  
    .state('app.aboutus', {
      url: '/aboutus',
      views: {
        'menuContent': {
          templateUrl: 'templates/aboutus.html'
        }
      }
    })
  
   .state('app.productdetail', {
    url: '/products/:id',
    cache:false,
    views: {
      'menuContent': {
        templateUrl: 'templates/productdetail.html',
        controller: 'ProductDetailController'
      }
    }
  })
  ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
})
/*.run(function ($rootScope) {
    var element;
    $rootScope.$on('$stateChangeStart', function (event, next) {
        if (next.name) {
            element = angular.element(document.querySelectorAll('ion-side-menu-content ion-header-bar'));
            console.log(element);
            element.addClass('bar-stable');
        }
    });
}) */ 
;
