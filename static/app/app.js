var app = {
    'dimensions': {
        'wheelbase': 20,
        'track': 20
    },

    'wheelPlacement': {
        'rf': [0, 0],
        'lf': [0, 0],
        'lr': [0, 0],
        'rr': [0, 0]
    },
    
    // this is the only function you need to look at
    // calculate angle and proportional speed of each drive unit
    // model found on the chiefdelphi site
    // fwd, str and rcw are ratios -1 to 1
    // returns array(8) first 4 are speed starting rf going ccw
    //                  second 4 are angle of attack starting at rf and going cw
    'swerveCalc': function (fwd, str, rcw) {
        var r = Math.sqrt(Math.pow(app.dimensions.wheelbase, 2) + Math.pow(app.dimensions.track, 2));
        var a = str - rcw * (app.dimensions.wheelbase / r);
        var b = str + rcw * (app.dimensions.wheelbase / r);
        var c = fwd - rcw * (app.dimensions.track / r);
        var d = fwd + rcw * (app.dimensions.track / r);
        console.log("r:" + r + ", a:" + a + ", b:" + b + ", c:" + c + ", d:" + d);

        // speeds
        var ws1 = Math.sqrt(Math.pow(b, 2) + Math.pow(c, 2));
        var maxWs = ws1;
        var ws2 = Math.sqrt(Math.pow(b, 2) + Math.pow(d, 2));
        maxWs = ws2 > maxWs ? ws2 : maxWs;
        var ws3 = Math.sqrt(Math.pow(a, 2) + Math.pow(d, 2));
        maxWs = ws3 > maxWs ? ws3 : maxWs;
        var ws4 = Math.sqrt(Math.pow(a, 2) + Math.pow(c, 2));
        maxWs = ws4 > maxWs ? ws4 : maxWs;

        ws1 = maxWs > 1 ? ws1 / maxWs : ws1;
        ws2 = maxWs > 1 ? ws2 / maxWs : ws2;
        ws3 = maxWs > 1 ? ws3 / maxWs : ws3;
        ws4 = maxWs > 1 ? ws4 / maxWs : ws4;
        console.log("ws1:" + ws1 + ", ws2:" + ws2 + ", ws3:" + ws3 + ", ws4:" + ws4 + ", maxws:" + maxWs);

        // angles
        var wa1 = (c == 0 && b == 0) ? 0.0 : (Math.atan2(b, c) * 180 / Math.PI);
        var wa2 = (d == 0 && b == 0) ? 0.0 : (Math.atan2(b, d) * 180 / Math.PI);
        var wa3 = (d == 0 && a == 0) ? 0.0 : (Math.atan2(a, d) * 180 / Math.PI);
        var wa4 = (c == 0 && a == 0) ? 0.0 : (Math.atan2(a, c) * 180 / Math.PI);
        console.log("wa1:" + wa1 + ", wa2:" + wa2 + ", wa3:" + wa3 + ", wa4:" + wa4);

        return [ws1, ws2, ws3, ws4, wa1, wa2, wa3, wa4];
    },

    'init': function () {
        $("#reset").bind({
            click: this.resetBot
        });
        $("#go").bind({
            click: this.go
        });
        $(document).keydown(this.checkKey);
        this.resetBot();
    },

    'checkKey': function (event) {
        /*
         *  W S A D = 87 , 83 , 65 , 68
         *  U D L R =  38 , 40, 37 , 39
         *  Space   = 32
         */
        var wsad = $("#wsad_slider").val();
        if(wsad == 1){
            var upKey = 87;
            var downKey = 83;
            var altUpKey =  38;
            var altDownKey = 40;
            var leftKey = 65;
            var rightKey = 68;
            var rotCWKey = 39;
            var rotCCWKey = 37;
            var jumpKey = 32;
        }else{
            upKey = 38;
            downKey = 40;
            altUpKey = 87;
            altDownKey = 83;
            leftKey = 37;
            rightKey = 39;
            rotCWKey = 68;
            rotCCWKey = 65;
            jumpKey = 32;
        }
        //console.log('key: ' + event.which);
        if (event.which == rotCWKey) {
            event.preventDefault();
            var x = parseInt($("#rcw_slider").val()) + 1;
            if (x <= 10) {
                $("#rcw_slider").val(x);
                $("#rcw_label_id").text(x / 10);
            }
        } else if (event.which == rotCCWKey) {
            event.preventDefault();
            var x = parseInt($("#rcw_slider").val()) - 1;
            if (x >= -10) {
                $("#rcw_slider").val(x);
                $("#rcw_label_id").text(x / 10);
            }
        } else if (event.which == upKey || event.which == altUpKey) {
            event.preventDefault();
            var x = parseInt($("#fwd_slider").val()) + 1;
            if (x <= 10) {
                $("#fwd_slider").val(x);
                $("#fwd_label_id").text(x / 10);
            }
        } else if (event.which == downKey || event.which == altDownKey) {
            event.preventDefault();
            var x = parseInt($("#fwd_slider").val()) - 1;
            if (x >= -10) {
                $("#fwd_slider").val(x);
                $("#fwd_label_id").text(x / 10);
            }
        } else if (event.which == leftKey) {
            event.preventDefault();
            var x = parseInt($("#str_slider").val()) - 1;
            if (x >= -10) {
                $("#str_slider").val(x);
                $("#str_label_id").text(x / 10);
            }
        } else if (event.which == rightKey) {
            event.preventDefault();
            var x = parseInt($("#str_slider").val()) + 1;
            if (x <= 10) {
                $("#str_slider").val(x);
                $("#str_label_id").text(x / 10);
            }
        } else if(event.which == jumpKey){
            event.preventDefault();
            $("#iterations_slider").val(10);
            $("#iterations_label_id").text(10);
            app.move();
        }
        return true;
    },

    'resetBot': function () {
        app.scale = parseFloat($("#scale_label_id").text());
        app.speed = parseFloat($("#speed_label_id").text());

        app.dimensions.track = parseFloat($("#track").val());
        app.dimensions.wheelbase = parseFloat($("#wheelbase").val());

        app.wheelPlacement.rf = [app.dimensions.track * app.scale, app.dimensions.wheelbase * app.scale];
        app.wheelPlacement.lf = [0, app.dimensions.wheelbase * app.scale];
        app.wheelPlacement.lr = [0, 0];
        app.wheelPlacement.rr = [app.dimensions.track * app.scale, 0];
        app.center = [app.dimensions.track*app.scale/2,app.dimensions.wheelbase*app.scale/2];

        app.clear();
        app.redraw();
    },

    'clear': function () {},

    'go': function () {
        var continuous = $("#continuous_slider").val();
        if(continuous == 1){
            var amount = 0;
            var interval = setInterval(function () {
                amount += 1;
                continuous = $("#continuous_slider").val();
                if (continuous == 0) {
                    amount = 0;
                    clearInterval(interval);
                } else {
                    app.move();
                }
            }, 100);
        }else{
            var iterations = parseInt($("#iterations_label_id").text());
            var amount = 0;
            var interval = setInterval(function () {
                amount += 1;
                if (amount > iterations) {
                    amount = 0;
                    clearInterval(interval);
                } else {
                    app.move();
                }
            }, 100);
        }
    },

    'move': function () {
        // get fwd, str, rcw
        var fwd = parseFloat($("#fwd_label_id").text());
        var str = parseFloat($("#str_label_id").text());
        var rcw = parseFloat($("#rcw_label_id").text());

        // calc swerve
        var swerve = app.swerveCalc(fwd, str, rcw);

        // recalc position on screen
        app.newCoordinates(fwd, str, rcw);

        // update table
        $("#rfv").text(swerve[0]);
        $("#lfv").text(swerve[1]);
        $("#lrv").text(swerve[2]);
        $("#rrv").text(swerve[3]);
        $("#rfa").text(swerve[4]);
        $("#lfa").text(swerve[5]);
        $("#lra").text(swerve[6]);
        $("#rra").text(swerve[7]);

        $("#rfx").text(app.wheelPlacement.rf[0]);
        $("#rfy").text(app.wheelPlacement.rf[1]);
        $("#lfx").text(app.wheelPlacement.lf[0]);
        $("#lfy").text(app.wheelPlacement.lf[1]);
        $("#lrx").text(app.wheelPlacement.lr[0]);
        $("#lry").text(app.wheelPlacement.lr[1]);
        $("#rrx").text(app.wheelPlacement.rr[0]);
        $("#rry").text(app.wheelPlacement.rr[1]);

        $("#rflf").text(app.distance(app.wheelPlacement.rf, app.wheelPlacement.lf));
        $("#lflr").text(app.distance(app.wheelPlacement.lf, app.wheelPlacement.lr));
        $("#lrrr").text(app.distance(app.wheelPlacement.lr, app.wheelPlacement.rr));
        $("#rrrf").text(app.distance(app.wheelPlacement.rr, app.wheelPlacement.rf));

        app.redraw();
    },

    'transformIt': function () {
        var s = new Array(4);
        var midX = 400;
        var midY = 600;
        s[0] = [midX + (app.wheelPlacement.rf[0]), midY - (app.wheelPlacement.rf[1])];
        s[1] = [midX + (app.wheelPlacement.lf[0]), midY - (app.wheelPlacement.lf[1])];
        s[2] = [midX + (app.wheelPlacement.lr[0]), midY - (app.wheelPlacement.lr[1])];
        s[3] = [midX + (app.wheelPlacement.rr[0]), midY - (app.wheelPlacement.rr[1])];
        return s;
    },

    'redraw': function () {
        var s = app.transformIt();
        var c = document.getElementById("botland");
        var ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'green';
        ctx.moveTo(s[0][0], s[0][1]);
        ctx.lineTo(s[1][0], s[1][1]);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'black';
        ctx.moveTo(s[1][0], s[1][1]);
        ctx.lineTo(s[2][0], s[2][1]);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'red';
        ctx.moveTo(s[2][0], s[2][1]);
        ctx.lineTo(s[3][0], s[3][1]);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'black';
        ctx.moveTo(s[3][0], s[3][1]);
        ctx.lineTo(s[0][0], s[0][1]);
        ctx.stroke();
        ctx.closePath();
        app.drawAirship(400, 200, 1.75);
    },

    'newCoordinates': function(fwd, str, rcw){

        // 1. position current bot on grid
        app.wheelPlacement.rf = [app.wheelPlacement.rf[0] + str * app.scale, app.wheelPlacement.rf[1] + fwd * app.scale];
        app.wheelPlacement.lf = [app.wheelPlacement.lf[0] + str * app.scale, app.wheelPlacement.lf[1] + fwd * app.scale];
        app.wheelPlacement.lr = [app.wheelPlacement.lr[0] + str * app.scale, app.wheelPlacement.lr[1] + fwd * app.scale];
        app.wheelPlacement.rr = [app.wheelPlacement.rr[0] + str * app.scale, app.wheelPlacement.rr[1] + fwd * app.scale];
        app.center = [app.center[0] + str * app.scale, app.center[1] + fwd * app.scale];

        // 2. rotate bot corners around new center point
        var rd = rcw * -.1;  // set arbitray radians as function of rcw and flip for ccw

        var tx = app.wheelPlacement.rf[0] - app.center[0];
        var ty = app.wheelPlacement.rf[1] - app.center[1];
        var rrfx = tx*Math.cos(rd) - ty*Math.sin(rd);
        var rrfy = tx*Math.sin(rd) + ty*Math.cos(rd);
        app.wheelPlacement.rf[0] = rrfx + app.center[0];
        app.wheelPlacement.rf[1] = rrfy + app.center[1];

        tx = app.wheelPlacement.lf[0] - app.center[0];
        ty = app.wheelPlacement.lf[1] - app.center[1];
        var rlfx = tx*Math.cos(rd) - ty*Math.sin(rd);
        var rlfy = tx*Math.sin(rd) + ty*Math.cos(rd);
        app.wheelPlacement.lf[0] = rlfx + app.center[0];
        app.wheelPlacement.lf[1] = rlfy + app.center[1];

        tx = app.wheelPlacement.lr[0] - app.center[0];
        ty = app.wheelPlacement.lr[1] - app.center[1];
        var rlrx = tx*Math.cos(rd) - ty*Math.sin(rd);
        var rlry = tx*Math.sin(rd) + ty*Math.cos(rd);
        app.wheelPlacement.lr[0] = rlrx + app.center[0];
        app.wheelPlacement.lr[1] = rlry + app.center[1];

        tx = app.wheelPlacement.rr[0] - app.center[0];
        ty = app.wheelPlacement.rr[1] - app.center[1];
        var rrrx = tx*Math.cos(rd) - ty*Math.sin(rd);
        var rrry = tx*Math.sin(rd) + ty*Math.cos(rd);
        app.wheelPlacement.rr[0] = rrrx + app.center[0];
        app.wheelPlacement.rr[1] = rrry + app.center[1];
    },

    'distance': function (c1, c2) {
        return Math.sqrt(Math.pow(c2[0] - c1[0], 2) + Math.pow(c2[1] - c1[1], 2));
    },

    'drawAirship': function(ox, oy, scale){
        var airship = $("#airship_slider").val();
        if(airship == 1){
            var o = 51*scale;
            var h = o / (Math.sin(60*Math.PI/180))
            var a = Math.cos(60*Math.PI/180)*h
            var points = [
                [a+ox,2*o+oy],
                [0+ox,o+oy],
                [a+ox,0+oy],
                [3*a+ox,0+oy],
                [4*a+ox,o+oy],
                [3*a+ox,2*o+oy]
                ];
            var c = document.getElementById("botland");
            var ctx = c.getContext("2d");
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'blue';
            for(var i=0;i<points.length;i++){
                if(i==0){
                    ctx.moveTo(points[i][0], points[i][1]);
                }else{
                    ctx.lineTo(points[i][0], points[i][1]);
                }
            }
            ctx.lineTo(points[0][0], points[0][1]);
            ctx.stroke();
            ctx.closePath();
        }
    }
}
app.init();