angular.module('partynestapp.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $state, $ionicHistory, $ionicModal, $timeout, $localStorage, $cordovaVibration, AuthService, Contact) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    $scope.loginData = {};
    $scope.registration = {};
    $scope.loggedIn = false;
    $scope.isAdminUser = false;
    $scope.username = '';
    $scope.userId = '';
    
    if(AuthService.isAuthenticated()) {
        console.log ("AppCtrl - Customer is already authenticated: ");
        $scope.loggedIn = true;
        $scope.username = AuthService.getUsername();
        $scope.userId = AuthService.getUserid();
        $scope.isAdminUser = AuthService.testAdminRole($scope.userId);
    }

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
    $localStorage.storeObject('userinfo',$scope.loginData);
    AuthService.login($scope.loginData);
    $scope.closeLogin();
    // Vibrate 100ms
    $cordovaVibration.vibrate(100);
  };
        
  $scope.logout = function() {
        console.log('Doing logout');
       AuthService.logout();
       $scope.loggedIn = false;
       $scope.isAdminUser = false;
       $scope.username = '';
       $scope.userId = '';
        $ionicHistory.nextViewOptions({
            historyRoot: true,
            disableBack: true
        });
        // Vibrate 100ms
        $cordovaVibration.vibrate(100);
        $state.go('app.home', null, {reload: true});
  };
    
    // Create the register modal that we will use later
    $ionicModal.fromTemplateUrl('templates/register.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.registerform = modal;
    });

    // Triggered in the register modal to close it
    $scope.closeRegister = function () {
        $scope.registerform.hide();
    };

    // Open the register modal
    $scope.register = function () {
        $scope.registerform.show();
    };

    // Perform the register action when the user submits the registration form
    $scope.doRegister = function () {
        console.log('Doing registration', $scope.registration);
        
        $scope.loginData.username = $scope.registration.username;
        $scope.loginData.password = $scope.registration.password;

        AuthService.register($scope.registration);
 
        $scope.closeRegister();
       
    };
    
    // Create the modal that we will use later
    $ionicModal.fromTemplateUrl('templates/contactus.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.contactForm = modal;
    });

    // Triggered in the modal to close it
    $scope.closeContactForm = function () {
        $scope.contactForm.hide();
    };

    // Open the contact modal
    $scope.showContactForm = function () {
        $scope.contactForm.show();
    };
    
    $scope.feedback = {
        mychannel: "Email",
        firstName: "",
        lastName: "",
        agree: true,
        email: "",
        telno : "",
        feedback : ""
    };

    var channels = [{
        value: "tel",
        label: "Tel."
    }, {
        value: "Email",
        label: "Email"
    }];

    $scope.channels = channels;
    $scope.invalidChannelSelection = false;
                                      
    $scope.sendFeedback = function () {
        console.log('Trying to create ', $scope.feedback);
        if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
            $scope.invalidChannelSelection = true;
        } else {
            $scope.invalidChannelSelection = false;
            Contact
                .create($scope.feedback)
                .$promise
                .then(function(result) {
                    $scope.feedback = {
                                mychannel: "Email",
                                firstName: "",
                                lastName: "",
                                agree: true,
                                email: "",
                                telno: "",
                                feedback : ""
                    };   
                })
                .catch(function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                    console.error('create Contact error', response.status, response.data);
                });
        }
        $scope.closeContactForm();
    };
    
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthService.isAuthenticated();
        $scope.username = AuthService.getUsername();
        $scope.userId = AuthService.getUserid();
        $scope.isAdminUser = AuthService.testAdminRole($scope.userId);  
    });
    
    $rootScope.$on('registration:Successful', function () {
        // $localStorage.storeObject('userinfo',$scope.loginData);
        $scope.doLogin();
    });
    
})

.controller('IndexController', ['$scope', '$state', 'Message', 'Featured', 'Product',
                        function($scope, $state, Message, Featured, Product) {
    $scope.showMsg = false;
    $scope.showFeatured = false;
    $scope.featureds = [];
    $scope.featuredmsg = "Loading data ...";
                            
    console.log("In Index Controller");
    Message.findOne()
                .$promise
                .then(function(results) {
                    $scope.message = results;
                    $scope.showMsg = true;
                console.log("Retrieved message ",$scope.message);
    });
    
    function getFeatureds() {
    Featured
        .find({"filter" : {"include" : "product"}})
        .$promise
        .then(function(results) {
            results.forEach(function(obj) {
                if (obj.product.label == " ") {
                    obj.product.label = "";
                }
            });
            $scope.featureds = results;
            $scope.showFeatured = true;
            $scope.featured = $scope.featureds[0].product;
            $scope.featureds.splice(0,1);
            console.log ("Featureds are:",results);
        })
        .catch(function(response) {
          $scope.featuredmsg = "Error: "+response.status + " " + response.statusText;
          console.error('getFeatureds error', response.status, response.data);
        });
    }
    if (!$scope.showFeatured) {
        getFeatureds();
    }                                            
}])

.controller('ProductController', ['$scope', '$state', 'Product', 'Theme', function($scope,
      $state, Product, Theme) {
    
    $scope.filtText = "";
    $scope.showDetails = false;
    $scope.showProducts = false;
    $scope.emptyWislist = false;
    $scope.message = "Loading ...";
    $scope.products = [];
    $scope.themes = [];
    
    $scope.updateFilter = function(txt) {
        $scope.filtText = txt;
        console.log ("New filttext",$scope.filtText);
    };
    
    function getThemes() {
      Theme
        .find()
        .$promise
        .then(function(results) {
          $scope.themes = results;
        });
    }
    getThemes();
    
    function getProducts() {
      Product
        .find()
        .$promise
        .then(function(results) {
          $scope.products = results;
          $scope.showProducts = true;
          console.log ("Products are:",results);
        })
        .catch(function(response) {
          $scope.message = "Error: "+response.status + " " + response.statusText;
          console.error('getProducts error', response.status, response.data);
        });
    }
    getProducts();
   
    $scope.toggleDetails = function() {
        $scope.showDetails = !$scope.showDetails;
    };
      
}])

.controller('WishlistController', ['$scope', '$state', '$window', '$rootScope', '$cordovaToast', 'AuthService', 'Customer', 'Product', 'Wishlist', 
                                 function ($scope, $state, $window, $rootScope, $cordovaToast, AuthService, Customer, Product, Wishlist) {
       
    $scope.loggedIn = false;
    $scope.wishlist = [];
    $scope.nItems = 0;
    $scope.userId = "";
    $scope.message = "Loading ...";
                                     
    $scope.$on('$ionicView.enter', function(e) {
    if (AuthService.isAuthenticated()) {
        console.log ("WishlistCtrl Customer is already authenticated: ");
        $scope.userId = AuthService.getUserid();
        $scope.loggedIn = true;
    }
    else 
    {
        console.log ("Customer is not authenticated in WishlistCtrl: ");
        $scope.loggedIn = false;
    }
    if ($scope.loggedIn) {                                
        getWishlist();
    }
    });                                     
     
    $rootScope.$on('logout', function () {
        console.log ("WishlistController Customer is no longer authenticated: ");
        $scope.message = "You must be logged in to  view your wishlist";
        $scope.loggedIn = false;
        $scope.nItems = 0;
        $scope.wishlist = [];
        $scope.userId =  "";
    });
     
                         
    function getWishlist() {
    Customer
        .wishlists({id:$scope.userId, "filter" : {"include" : "product"}})
        .$promise
        .then(function(results) {
            $scope.wishlist = results;
            $scope.nItems = $scope.wishlist.length;
            $scope.showWishlist = true;
            console.log ("Wishlist is:",$scope.wishlist);
        })
        .catch(function(response) {
          $scope.message = "Error: "+response.status + " " + response.statusText;
          console.error('getWishlist error', response.status, response.data);
        });
    }
                                      
    $scope.removeFromWishlist = function(item) {
      Wishlist
        .deleteById({id: item.id})
        .$promise
        .then(function() {
          $cordovaToast.showShortCenter('Removed from wishlist').then(function(success) {
            // success
            }, function (error) {
            // error
            });
          //$window.location.reload();
        });
        getWishlist();
        $state.go($state.current, null, {reload: true});
    };
    
}])

.controller('ProductDetailController', ['$scope', '$rootScope', '$state', '$stateParams', '$ionicModal', '$cordovaToast', 'Product', 'AuthService', 'Wishlist',
                                        function($scope, $rootScope, $state, $stateParams, $ionicModal, $cordovaToast, Product, AuthService, Wishlist) {
    $scope.product = {};
    $scope.reviews = [];
    $scope.showProduct = false;
    $scope.showReviews = false;
    $scope.message="Loading ...";
    $scope.loggedIn = false;
    $scope.userId = "";
    $scope.newcomment = {rating:5, review:"", productId:"", customerId:""};
    $scope.newcomment.productId = $stateParams.id;    

    if (AuthService.isAuthenticated()) {
        console.log ("ProductDetailCtl Customer is already authenticated: ");
        $scope.userId = AuthService.getUserid();
        $scope.newcomment.customerId = $scope.userId;
        $scope.loggedIn = true;
    }
    else 
    {
        console.log ("Customer is not authenticated in ProductDetailCtrl: ");
        $scope.loggedIn = false;
    }
        
    $rootScope.$on('logout', function () {
        console.log ("ProductDetailCtl Customer is no longer authenticated: ");
        $scope.loggedIn = false;
        $scope.userId =  "";
    });
                                            
    function getProduct() {
    Product
        .findById({id:$stateParams.id})
        .$promise
        .then(function(results) {
          $scope.product = results;
            if ($scope.product.label == " ") {
                $scope.product.label = "";
            }
          $scope.showProduct = true;
          console.log ("Product is:",$scope.product);
        })
        .catch(function(response) {
          $scope.message = "Error: "+response.status + " " + response.statusText;
          console.error('getProduct error', response.status, response.data);
        });
    }
    getProduct();
    
    function getReviews() {
    Product
        .reviews({id:$stateParams.id})
        .$promise
        .then(function(results) {
            $scope.reviews = results;
            $scope.showReviews = true;
            console.log ("Reviews are:",$scope.reviews);
        })
        .catch(function(response) {
          $scope.message = "Error: "+response.status + " " + response.statusText;
          console.error('getReviews error', response.status, response.data);
        });
    }
    getReviews();
                                            
    $scope.addToWishlist = function(productid) {
        
      console.log ("adding to customer product ", $scope.userId, productid);
      Wishlist
        .create({customerId: $scope.userId, productId: productid })
        .$promise
        .then(function() {
          console.log ("added to customer product ", $scope.userId, productid);
          $cordovaToast.showShortCenter('Added to wishlist').then(function(success) {
            // success
            }, function (error) {
            // error
            });
        })
        .catch(function(response) {
          $scope.message = "Error: "+response.status + " " + response.statusText;
          console.error('wishlists.create error', response.status, response.data);
        });;
    };
    
    $scope.submitComment = function () {
        console.log($scope.newcomment);
        Product
        .reviews.create({id:$stateParams.id},$scope.newcomment)
        .$promise
        .then(function(results) {
            $scope.reviews = results;
            $scope.showReviews = true;
            console.log ("Reviews are:",$scope.reviews);
            $cordovaToast.showShortCenter('Thank you for your review').then(function(success) {
            // success
            }, function (error) {
            // error
            });
        })
        .catch(function(response) {
          $scope.message = "Error: "+response.status + " " + response.statusText;
          console.error('createReview error', response.status, response.data);
        });
        $scope.closeReviewForm();
        $scope.newcomment = {rating:5, review:"", productId:"", customerId:""};
        $scope.newcomment.productId = $stateParams.id;
        if ($rootScope.currentUser)
            $scope.newcomment.customerId = $rootScope.currentUser.id;
        $state.go($state.current, null, {reload: true});
    };
                                            
    // Create the modal that we will use later
    $ionicModal.fromTemplateUrl('templates/reviewform.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.reviewForm = modal;
    });

    // Triggered in the modal to close it
    $scope.closeReviewForm = function () {
        $scope.reviewForm.hide();
    };

    // Open the review modal
    $scope.showReviewForm = function (productid) {
        $scope.reviewForm.show();
        //$scope.popover.hide();
    };
            
}])

;
