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

    'init': function () {
        $("#start").bind({
            click: this.resetBot
        });
        $("#move").bind({
            click: this.move
        });
    },

    'resetBot': function () {
        app.dimensions.track = parseFloat($("#track").val());
        app.dimensions.wheelbase = parseFloat($("#wheelbase").val());
        app.scale = parseFloat($("#scale").val());

        app.wheelPlacement.rf = [app.dimensions.track, app.dimensions.wheelbase];
        app.wheelPlacement.lf = [0, app.dimensions.wheelbase];
        app.wheelPlacement.lr = [0, 0];
        app.wheelPlacement.rr = [app.dimensions.track, 0];

        app.clear();
        app.redraw();
    },

    'clear': function () {},

    'move': function () {
        // get fwd, str, rcw
        var fwd = parseFloat($("#fwd").val());
        var str = parseFloat($("#str").val());
        var rcw = parseFloat($("#rcw").val());

        // calc swerve
        var swerve = app.swerveCalc(fwd, str, rcw);

        // recaclulate new positions for canvas
        app.wheelPlacement.rf = app.newCoordiates(app.wheelPlacement.rf, swerve[4], swerve[0]);
        app.wheelPlacement.lf = app.newCoordiates(app.wheelPlacement.lf, swerve[5], swerve[1]);
        app.wheelPlacement.lr = app.newCoordiates(app.wheelPlacement.lr, swerve[6], swerve[2]);
        app.wheelPlacement.rr = app.newCoordiates(app.wheelPlacement.rr, swerve[7], swerve[3]);

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

        $("#rflf").text(app.distance(app.wheelPlacement.rf,app.wheelPlacement.lf));
        $("#lflr").text(app.distance(app.wheelPlacement.lf,app.wheelPlacement.lr));
        $("#lrrr").text(app.distance(app.wheelPlacement.lr,app.wheelPlacement.rr));
        $("#rrrf").text(app.distance(app.wheelPlacement.rr,app.wheelPlacement.rf));

        app.redraw();
    },

    'transformIt': function () {
        var s = new Array(4);
        var midX = 400;
        var midY = 400;
        s[0] = [midX + (app.wheelPlacement.rf[0] * app.scale), midY - (app.wheelPlacement.rf[1] * app.scale)];
        s[1] = [midX + (app.wheelPlacement.lf[0] * app.scale), midY - (app.wheelPlacement.lf[1] * app.scale)];
        s[2] = [midX + (app.wheelPlacement.lr[0] * app.scale), midY - (app.wheelPlacement.lr[1] * app.scale)];
        s[3] = [midX + (app.wheelPlacement.rr[0] * app.scale), midY - (app.wheelPlacement.rr[1] * app.scale)];
        return s;
    },

    'redraw': function () {
        var s = app.transformIt();
        var c = document.getElementById("botland");
        var ctx = c.getContext("2d");
        ctx.moveTo(s[0][0], s[0][1]);
        ctx.lineTo(s[1][0], s[1][1]);
        ctx.lineTo(s[2][0], s[2][1]);
        ctx.lineTo(s[3][0], s[3][1]);
        ctx.lineTo(s[0][0], s[0][1]);
        ctx.stroke();
    },

    'newCoordiates': function (xy, a, h) {
        console.log("a:"+a+", h:"+h);
        var result = new Array(2);
        var speedFactor = .5;
        if(a >= 0 && a < 90){
            result[0] = xy[0] + (Math.sin(a*Math.PI/180) * h * speedFactor);            
            result[1] = xy[1] + (Math.cos(a*Math.PI/180) * h * speedFactor);
        } else if(a >= 90 && a <= 180){
            result[0] = xy[0] + (Math.cos((a-90)*Math.PI/180) * h * speedFactor);
            result[1] = xy[1] - (Math.sin((a-90)*Math.PI/180) * h * speedFactor);            
        } else if(a < 0 && a > -90) {
            result[0] = xy[0] - (Math.sin(Math.abs(a)*Math.PI/180) * h * speedFactor);            
            result[1] = xy[1] + (Math.cos(Math.abs(a)*Math.PI/180) * h * speedFactor);
        } else if(a <= -90 && a >= -180) {
            result[0] = xy[0] - (Math.cos((Math.abs(a)-90)*Math.PI/180) * h * speedFactor);
            result[1] = xy[1] - (Math.sin((Math.abs(a)-90)*Math.PI/180) * h * speedFactor);            
        }
        return result;
    },

    'distance': function(c1,c2){
        return Math.sqrt(Math.pow(c2[0]-c1[0],2)+Math.pow(c2[1]-c1[1],2));
    },

    'swerveCalc': function (fwd, str, rcw) {
        fwd = fwd;
        str = str;
        rcw = rcw;
        
        var r = Math.sqrt(Math.pow(app.dimensions.wheelbase, 2) + Math.pow(app.dimensions.track, 2));
        var a = str - rcw * (app.dimensions.wheelbase / r);
        var b = str + rcw * (app.dimensions.wheelbase / r);
        var c = fwd - rcw * (app.dimensions.track / r);
        var d = fwd + rcw * (app.dimensions.track / r);
        console.log("r:" + r + ", a:" + a + ", b:" + b + ", c:" + c + ", d:" + d);

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

        var wa1 = (c == 0 && b == 0) ? 0.0 : (Math.atan2(b, c) * 180 / Math.PI);
        var wa2 = (d == 0 && b == 0) ? 0.0 : (Math.atan2(b, d) * 180 / Math.PI);
        var wa3 = (d == 0 && a == 0) ? 0.0 : (Math.atan2(a, d) * 180 / Math.PI);
        var wa4 = (c == 0 && a == 0) ? 0.0 : (Math.atan2(a, c) * 180 / Math.PI);
        console.log("wa1:" + wa1 + ", wa2:" + wa2 + ", wa3:" + wa3 + ", wa4:" + wa4);

        return [ws1, ws2, ws3, ws4, wa1, wa2, wa3, wa4];
    }

}
app.init();