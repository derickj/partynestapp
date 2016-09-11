'use strict';

angular
  .module('partynestapp.services',[])
  .constant("baseURL", "http://partynest.eu-gb.mybluemix.net/")
  .factory('AuthService', ['Customer', 'Role', '$q', '$rootScope',  '$ionicPopup',  
                           function(Customer, Role, $q, $rootScope, $ionicPopup) {
                               
    $rootScope.admins = {principalid : 0};
    
    Role.findOne(function (response) {
        console.log ("role found", response);
        if (response.name == "admin"){
            console.log ("admin role found", response.id, response);
            Role.prototype$__get__principals ({id : response.id}, function (principals){
                var cnt = principals.length;
                console.log ("n principals with admin role found", cnt, principals);
                $rootScope.admins.principalId = principals[0].principalId;
            });
        }
        else {
            console.log ("admin role not found", response);
        }
    });
                                     
    function testAdminRole (userid) {
        var found = false;
        if ($rootScope.admins.principalId == userid) {
            console.log ("admin user found", $rootScope.admins.principalId);
            found = true;
        }
        else {
            console.log ("admin user not found", $rootScope.admins.principalId, userid);
        }
        return (found);
    };
                               
    function login(loginData) {
      return Customer
        .login(loginData)
        .$promise
        .then(function(response) {
          console.log ("AuthService login successful: ", response);
          $rootScope.currentUser = {
            id: response.user.id,
            tokenId: response.id,
            username: loginData.username
          };
          $rootScope.$broadcast('login:Successful');
        },
        function(response){

            var message = '<div><p>' +  response.data.error.message + 
                  '</p><p>' + response.data.error.name + '</p></div>';
            
               var alertPopup = $ionicPopup.alert({
                    title: '<h4>Login Unsuccessful</h4>',
                    template: message
                });

                alertPopup.then(function(res) {
                    console.log('Login Unsuccessful', response);
                });
          
        });
    }
      
    function isAuthenticated() {
        if ($rootScope.currentUser) {
            return true;
        }
        else{
            return false;
        }
    }

    function getUserid() {
        return $rootScope.currentUser.id;
    }
      
    function getUsername() {
        return $rootScope.currentUser.username;
    }

    function logout() {
      return Customer
       .logout()
       .$promise
       .then(function() {
         $rootScope.currentUser = null;
          $rootScope.$broadcast('logout');
       });
    }

   function register(registerData) {
      return Customer
        .create(registerData
        /*  {
         username: registerData.username,
         email: registerData.email,
         password: registerData.password
       } */
      )
       .$promise
      .then (function(result) {
          console.log('Registered succesful', result);
          /*$rootScope.currentUser = {
            id: result.id,
            username: result.username
          }; */
          $rootScope.$broadcast('registration:Successful');
        },
        function(response){
                var message = '<div><p>' +  response.data.error.message + 
                  '</p><p>' + response.data.error.name + '</p></div>';
            
               var alertPopup = $ionicPopup.alert({
                    title: '<h4>Registration Unsuccessful</h4>',
                    template: message
                });

                alertPopup.then(function(res) {
                    console.log('Registration Unsuccessful', response);
                });
          
        });
    }

    return {
      login: login,
      logout: logout,
      register: register,
      isAuthenticated: isAuthenticated,
      getUsername: getUsername,
      getUserid: getUserid,
        testAdminRole: testAdminRole
    };
  }])

.factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key, defaultValue) {
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    }
}])
;
