
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = 'game.data';
    var REMOTE_PACKAGE_BASE = 'game.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
  
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
Module['FS_createPath']('/', 'fonts', true, true);
Module['FS_createPath']('/', 'graphics', true, true);
Module['FS_createPath']('/', 'lib', true, true);
Module['FS_createPath']('/lib', 'knife', true, true);
Module['FS_createPath']('/', 'sounds', true, true);
Module['FS_createPath']('/', 'src', true, true);
Module['FS_createPath']('/src', 'states', true, true);

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      },
    };

        var files = metadata.files;
        for (i = 0; i < files.length; ++i) {
          new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
        }

  
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
        // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
        // (we may be allocating before malloc is ready, during startup).
        if (Module['SPLIT_MEMORY']) Module.printErr('warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting');
        var ptr = Module['getMemory'](byteArray.length);
        Module['HEAPU8'].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
  
          var files = metadata.files;
          for (i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
              Module['removeRunDependency']('datafile_game.data');

    };
    Module['addRunDependency']('datafile_game.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": [{"audio": 0, "start": 0, "crunched": 0, "end": 6148, "filename": "/.DS_Store"}, {"audio": 0, "start": 6148, "crunched": 0, "end": 9432, "filename": "/main.lua"}, {"audio": 0, "start": 9432, "crunched": 0, "end": 28924, "filename": "/fonts/font.ttf"}, {"audio": 0, "start": 28924, "crunched": 0, "end": 52851, "filename": "/graphics/background.png"}, {"audio": 0, "start": 52851, "crunched": 0, "end": 69946, "filename": "/graphics/match3.png"}, {"audio": 0, "start": 69946, "crunched": 0, "end": 76094, "filename": "/lib/.DS_Store"}, {"audio": 0, "start": 76094, "crunched": 0, "end": 79160, "filename": "/lib/class.lua"}, {"audio": 0, "start": 79160, "crunched": 0, "end": 86389, "filename": "/lib/push.lua"}, {"audio": 0, "start": 86389, "crunched": 0, "end": 86809, "filename": "/lib/knife/base.lua"}, {"audio": 0, "start": 86809, "crunched": 0, "end": 88621, "filename": "/lib/knife/behavior.lua"}, {"audio": 0, "start": 88621, "crunched": 0, "end": 89388, "filename": "/lib/knife/bind.lua"}, {"audio": 0, "start": 89388, "crunched": 0, "end": 90113, "filename": "/lib/knife/chain.lua"}, {"audio": 0, "start": 90113, "crunched": 0, "end": 91431, "filename": "/lib/knife/convoke.lua"}, {"audio": 0, "start": 91431, "crunched": 0, "end": 93880, "filename": "/lib/knife/event.lua"}, {"audio": 0, "start": 93880, "crunched": 0, "end": 93911, "filename": "/lib/knife/gun.lua"}, {"audio": 0, "start": 93911, "crunched": 0, "end": 95872, "filename": "/lib/knife/memoize.lua"}, {"audio": 0, "start": 95872, "crunched": 0, "end": 98206, "filename": "/lib/knife/serialize.lua"}, {"audio": 0, "start": 98206, "crunched": 0, "end": 100370, "filename": "/lib/knife/system.lua"}, {"audio": 0, "start": 100370, "crunched": 0, "end": 103865, "filename": "/lib/knife/test.lua"}, {"audio": 0, "start": 103865, "crunched": 0, "end": 108748, "filename": "/lib/knife/timer.lua"}, {"audio": 0, "start": 108748, "crunched": 0, "end": 114896, "filename": "/sounds/.DS_Store"}, {"audio": 1, "start": 114896, "crunched": 0, "end": 125084, "filename": "/sounds/clock.wav"}, {"audio": 1, "start": 125084, "crunched": 0, "end": 151492, "filename": "/sounds/error.wav"}, {"audio": 1, "start": 151492, "crunched": 0, "end": 244902, "filename": "/sounds/game-over.wav"}, {"audio": 1, "start": 244902, "crunched": 0, "end": 309118, "filename": "/sounds/match.wav"}, {"audio": 1, "start": 309118, "crunched": 0, "end": 3310270, "filename": "/sounds/music.mp3"}, {"audio": 1, "start": 3310270, "crunched": 0, "end": 4177541, "filename": "/sounds/music2.mp3"}, {"audio": 1, "start": 4177541, "crunched": 0, "end": 11505219, "filename": "/sounds/music3.mp3"}, {"audio": 1, "start": 11505219, "crunched": 0, "end": 11686817, "filename": "/sounds/next-level.wav"}, {"audio": 1, "start": 11686817, "crunched": 0, "end": 11689713, "filename": "/sounds/select.wav"}, {"audio": 0, "start": 11689713, "crunched": 0, "end": 11695861, "filename": "/src/.DS_Store"}, {"audio": 0, "start": 11695861, "crunched": 0, "end": 11703255, "filename": "/src/Board.lua"}, {"audio": 0, "start": 11703255, "crunched": 0, "end": 11705006, "filename": "/src/Dependencies.lua"}, {"audio": 0, "start": 11705006, "crunched": 0, "end": 11705646, "filename": "/src/StateMachine.lua"}, {"audio": 0, "start": 11705646, "crunched": 0, "end": 11706626, "filename": "/src/Tile.lua"}, {"audio": 0, "start": 11706626, "crunched": 0, "end": 11708863, "filename": "/src/Util.lua"}, {"audio": 0, "start": 11708863, "crunched": 0, "end": 11709560, "filename": "/src/states/BaseState.lua"}, {"audio": 0, "start": 11709560, "crunched": 0, "end": 11712183, "filename": "/src/states/BeginGameState.lua"}, {"audio": 0, "start": 11712183, "crunched": 0, "end": 11713256, "filename": "/src/states/GameOverState.lua"}, {"audio": 0, "start": 11713256, "crunched": 0, "end": 11722414, "filename": "/src/states/PlayState.lua"}, {"audio": 0, "start": 11722414, "crunched": 0, "end": 11729007, "filename": "/src/states/StartState.lua"}], "remote_package_size": 11729007, "package_uuid": "cfa5f0bd-9e44-4232-90d7-22ca171f38da"});

})();
