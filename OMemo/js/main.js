$(function(){

    var OMemo = {};

    (function(app){

        var $ul = $('#memo-list'),
            li = ['<li>',
                       '<a href="#">',
                       '<h2>TITLE</h2>',
                       '<p>CONTENT</p>',
                       '<p class="ui-li-aside"><strong>TIME</strong></p>',
                       '<a href="#confirm" data-rel="popup" data-position-to="window" data-transition="pop" class="delete">Delete</a>',
                  '</li>'].join('');

        app.init = function(){
            app.bindings();
            app.displayMemos();
        };

        app.bindings = function(){
            $('#btnNewMemo').on('click', function(e){
                e.preventDefault();
                $('#time-new-memo').text("Last modified: "+app.getCurrentTime());
                $.mobile.changePage('#new-memo-page');
            });

            $('#btnCancel').on('click', function(e){
                e.preventDefault();
                $('#memo-title').val("");
                $('#memo-content').val("");
                window.history.back();
            });
            $('#btnSave').on('click', function(e){
                e.preventDefault();
                app.addMemo(
                    $('#memo-title').val(),
                    $('#memo-content').val()
                );
            });

            $('#btnDelete').on('click', function(e){
                e.preventDefault();
                var title = $('#memo-title-display').val();
                app.confirmAndDelete(title);                    
            });
            $('#btnSaveDisplay').on('click', function(e){
                e.preventDefault();
                app.addMemo(
                    $('#memo-title-display').val(),
                    $('#memo-content-display').val()
                );
            });

            $(document).on('click', '#memo-list li', function(e){
                e.preventDefault();
                var html = $(this)[0].innerHTML;
                var title = html.match(/<h2>(.*?)</)[0].replace("<h2>", "").replace("<", "");
                app.loadMemo(title);
            });

            $(document).on('click', '.delete', function(e){
                e.preventDefault();
                e.stopPropagation();
                var html = $(this).parent("li")[0].innerHTML;
                var title = html.match(/<h2>(.*?)</)[0].replace("<h2>", "").replace("<", "");
                app.confirmAndDelete(title);
                $.mobile.changePage('#main-page');
            });

            window.addEventListener( 'tizenhwkey', function( ev ) {
                if( ev.keyName === "back" ) {
                    var page = document.getElementsByClassName( 'ui-page-active' )[0],
                        pageid = page ? page.id : "";

                    if( pageid === "main-page" ) {
                        try {
                            tizen.application.getCurrentApplication().exit();
                        } catch (ignore) {
                        }
                    } else {
                        window.history.back();
                    }
                }
            } );
        };

        app.loadMemo = function(title){
            var memos = app.getMemos(),
                times = app.getTimes(),
                memo = memos[title],
                time = times[title],
                $memoTitle = $('#memo-title-display'),
                $memoContent = $('#memo-content-display'),
                $timeFlag = $('#time-display-memo');

            $memoTitle.val(title);
            $memoContent.val(memo);
            $timeFlag.text("Last modified: "+time);

            $.mobile.changePage('#display-memo-page');
        };

        app.addMemo = function(title, content){
            if (title == "" || title.replace(/\s*/g, "").length == 0) {
                $('#memo-title').val("");
                $('#memo-content').val("");
                $.mobile.changePage('#main-page');
                return;
            }

            var memos = localStorage['OMemo'],
                times = localStorage['Time'],
                memosObj,
                timesObj;
            if (memos === undefined || memos === '') {
                memosObj = {};
            } else {
                memosObj = JSON.parse(memos);
            }
            if (times === undefined || times === '') {
                timesObj = {};
            } else {
                timesObj = JSON.parse(times);
            }

            if (memosObj[title] != undefined) {
                if (memosObj[title] != content) {
                    delete memosObj[title]; 
                } else {
                    app.displayMemos();
                    return;
                }
            };
            memosObj[title] = content;
            timesObj[title] = app.getCurrentTime();
            localStorage['OMemo'] = JSON.stringify(memosObj);
            localStorage['Time'] = JSON.stringify(timesObj);

            $('#memo-title').val("");
            $('#memo-content').val("");

            app.displayMemos();
        };

        app.getMemos = function(){
            var memos = localStorage['OMemo'];
            return JSON.parse(memos);
        };

        app.getTimes = function(){
            var times = localStorage['Time'];
            return JSON.parse(times);
        };

        app.displayMemos = function(){
            var memosObj = app.getMemos(),
                timesObj = app.getTimes(),
                html = '',
                memo,
                checkForListDivider = {};

            var memoArray = new Array();
            for (memo in memosObj) { memoArray.push(memo); }
            for (var i = memoArray.length-1; i >= 0; i--) {
                var memo = memoArray[i];
                var time = timesObj[memo].split(" ")[0];
                if (checkForListDivider[time] != true) {
                    html += '<li data-role="list-divider">T</li>'.replace(/T/g, time);
                    checkForListDivider[time] = true;
                }
                html += li.replace(/TITLE/g, memo.replace(/-/g,' '))
                         .replace(/CONTENT/g, memosObj[memo])
                         .replace(/TIME/g, timesObj[memo].replace(time+' ', ""));
            }
            $ul.html(html).listview('refresh');
            $.mobile.changePage('#main-page');
        };

        app.confirmAndDelete = function(title) {
            /*$.mobile.changePage('#popup');
            $( "#confirm #yes" ).on( "click", function() {*/
                var memosObj = app.getMemos(),
                    timesObj = app.getTimes();
                delete memosObj[title];
                localStorage['OMemo'] = JSON.stringify(memosObj);
                delete timesObj[title];
                localStorage['Time'] = JSON.stringify(timesObj);
                app.displayMemos();
            /*});
            $( "#confirm #cancel" ).on( "click", function() {
                $( "#confirm #yes" ).off();
            });*/
        }

        app.getCurrentTime = function () { 
            var now = new Date();
            var year = now.getFullYear();           
                month = now.getMonth() + 1;     
                day = now.getDate();           
                hh = now.getHours();            
                mm = now.getMinutes();         
       
            var time = year + "-";
            if(month < 10) time += "0";
            time += month + "-";
            if(day < 10) time += "0";
            time += day + " ";
            if(hh < 10) time += "0";
            time += hh + ":";
            if (mm < 10) time += '0'; 
            time += mm; 
            return(time); 
        } 

        app.init();

    })(OMemo);
});