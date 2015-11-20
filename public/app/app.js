/*globals io, Visibility, _ */
'use strict';
angular.module('FileSync', ['ngAnimate', 'hljs','mgcrea.ngStrap','angular-smilies']);

angular.module('FileSync')
  .constant('io', io)
  .constant('Visibility', Visibility)
  .constant('_', _);
