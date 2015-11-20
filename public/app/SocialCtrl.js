'use strict';
angular
  .module('FileSync')
  .controller('SocialCtrl', ['$scope', 'SocketIOService', function($scope, SocketIOService) {
    this.viewers = [];
    this.messages = [];
    this.verifEmoteMsg ='';
    this.message = '';
    this.fileUploadMsg = '';

    //var arr = this.arr = [{"text": ":fuck", "img": "components/angular-smilies-master/src/smilies/nouveauSmile/fuk.gif"}];


    this.sendMessage = function() {
      console.log(this.message);
      SocketIOService.sendMessage(this.message);
      this.message = "";
    };

 function onMessagesUpdated(message) {

 this.messages.push(message);
     $scope.$apply();

 };
/*
 this.choixEmote = function(icone){
    console.log("ok");
    document.getElementById("tchatText").value += icone.text;
    console.log(document.getElementById("tchatText").value);
 };
  */
/*
  $(function () {//faire une directive
      $('#uploadForm').on('submit', function (e) {
          // On empêche le navigateur de soumettre le formulaire
          e.preventDefault();
          var $form = $(this);
          var formdata = (window.FormData) ? new FormData($form[0]) : null;
          var data = (formdata !== null) ? formdata : $form.serialize();

          $.ajax({
              url: $form.attr('action'),
              type: $form.attr('method'),
              contentType: false, // obligatoire pour de l'upload
              processData: false, // obligatoire pour de l'upload
              data: new FormData(this),
              xhr: function() {
              myXhr = $.ajaxSettings.xhr();
              return myXhr;
          },
          success: function(res) {
          	this.fileUploadMsg = res;
            $scope.$apply();
          },
          });
      });
  });
*/
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
