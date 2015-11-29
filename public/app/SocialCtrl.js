'use strict';
angular
  .module('FileSync')
  .controller('SocialCtrl', ['$scope', 'SocketIOService', function($scope, SocketIOService) {
    this.viewers = [];
    this.messages = [];
    this.verifEmoteMsg ='';
    this.message = '';
    this.fileUploadMsg = '';

    this.sendMessage = function() {
      console.log(this.message);
      SocketIOService.sendMessage(this.message);
      this.message = "";
    };

 function onMessagesUpdated(message) {

 this.messages.push(message);
     $scope.$apply();

 };

 SocketIOService.onMessagesUpdated(onMessagesUpdated.bind(this));

    function onViewersUpdated(viewers) {
      this.viewers = viewers;
      $scope.$apply();
    };

    SocketIOService.onViewersUpdated(onViewersUpdated.bind(this));

    function onFileUploading(verifEmoteMsg) {
      this.verifEmoteMsg = verifEmoteMsg;
      $scope.$apply();
    }

    SocketIOService.onFileUploading(onFileUploading.bind(this));


  }]);
