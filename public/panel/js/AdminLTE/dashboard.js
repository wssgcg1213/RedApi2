/*
 * Author: Abdullah A Almsaeed
 * Date: 4 Jan 2014
 * Description:
 *      This is a demo file used only for the main dashboard (index.html)
 **/

$(function() {
    "use strict";

    //Make the dashboard widgets sortable Using jquery UI
    $(".connectedSortable").sortable({
        placeholder: "sort-highlight",
        connectWith: ".connectedSortable",
        handle: ".box-header, .nav-tabs",
        forcePlaceholderSize: true,
        zIndex: 999999
    }).disableSelection();
    $(".box-header, .nav-tabs").css("cursor","move");
    //jQuery UI sortable for the todo list
    $(".todo-list").sortable({
        placeholder: "sort-highlight",
        handle: ".handle",
        forcePlaceholderSize: true,
        zIndex: 999999
    }).disableSelection();;

    //bootstrap WYSIHTML5 - text editor
    $(".textarea").wysihtml5();

    $('.all-daterange').daterangepicker(
        {
            ranges: {
                '今天': [moment(), moment()],
                '昨天': [moment().subtract('days', 1), moment().subtract('days', 1)],
                '一星期内': [moment().subtract('days', 6), moment()],
                '一个月内': [moment().subtract('days', 29), moment()],
                '这个月': [moment().startOf('month'), moment().endOf('month')],
                '上个月': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
            },
            startDate: moment(),
            endDate: moment()
        },function(start, end) {
            //这里是选定日期之后的回调函数
        alert("You chose: " + start + ' - ' + end.format('MMMM D, YYYY'));
    });



    //Sparkline charts
    var myvalues = [15, 19, 20, -22, -33, 27, 31, 27, 19, 30, 21];
    $('#sparkline-1').sparkline(myvalues, {
        type: 'bar',
        barColor: '#00a65a',
        negBarColor: "#f56954",
        height: '20px'
    });
    myvalues = [15, 19, 20, 22, -2, -10, -7, 27, 19, 30, 21];
    $('#sparkline-2').sparkline(myvalues, {
        type: 'bar',
        barColor: '#00a65a',
        negBarColor: "#f56954",
        height: '20px'
    });
    myvalues = [15, -19, -20, 22, 33, 27, 31, 27, 19, 30, 21];
    $('#sparkline-3').sparkline(myvalues, {
        type: 'bar',
        barColor: '#00a65a',
        negBarColor: "#f56954",
        height: '20px'
    });
    myvalues = [15, 19, 20, 22, 33, -27, -31, 27, 19, 30, 21];
    $('#sparkline-4').sparkline(myvalues, {
        type: 'bar',
        barColor: '#00a65a',
        negBarColor: "#f56954",
        height: '20px'
    });
    myvalues = [15, 19, 20, 22, 33, 27, 31, -27, -19, 30, 21];
    $('#sparkline-5').sparkline(myvalues, {
        type: 'bar',
        barColor: '#00a65a',
        negBarColor: "#f56954",
        height: '20px'
    });
    myvalues = [15, 19, -20, 22, -13, 27, 31, 27, 19, 30, 21];
    $('#sparkline-6').sparkline(myvalues, {
        type: 'bar',
        barColor: '#00a65a',
        negBarColor: "#f56954",
        height: '20px'
    });

    /* Morris.js Charts */
    // Sales chart
    var area = new Morris.Area({
        element: 'revenue-chart',
        resize: true,
        data: [
            {y: '0-1点', pv: 2666},
            {y: '1-2点', pv: 2778},
            {y: '2-3点', pv: 4912},
            {y: '3-4点', pv: 3767},
            {y: '5-6点', pv: 6810},
            {y: '5-6点', pv: 5670},
            {y: '6-7点', pv: 4820},
            {y: '7-8点', pv: 1577},
            {y: '8-9点', pv: 1060},
            {y: '9-10点', pv: 8432},
            {y: '10-11点', pv: 2666},
            {y: '11-12点', pv: 2778},
            {y: '12-13点', pv: 4912},
            {y: '13-14点', pv: 3767},
            {y: '15-16点', pv: 6810},
            {y: '15-16点', pv: 5670},
            {y: '16-17点', pv: 4820},
            {y: '17-18点', pv: 1577},
            {y: '18-19点', pv: 1060},
            {y: '19-20点', pv: 1060},
            {y: '20-21点', pv: 1060},
            {y: '21-22点', pv: 1060},
            {y: '22-23点', pv: 1060},
            {y: '23-24点', pv: 1060}

        ],
        xkey: 'y',
        ykeys: ['pv'],
        labels: ['pv'],
        xLabelFormat: function(x){return ''},
        lineColors: ['#a0d0e0', '#3c8dbc'],
        hideHover: 'auto'
    });
    //Donut Chart
    var donut = new Morris.Donut({
        element: 'sales-chart',
        resize: true,
        colors: ["#3c8dbc", "#f56954", "#00a65a"],
        data: [
            {label: "Download Sales", value: 12},
            {label: "In-Store Sales", value: 30},
            {label: "Mail-Order Sales", value: 20}
        ],
        hideHover: 'auto'
    });

    //Fix for charts under tabs
    $('.box ul.nav a').on('shown.bs.tab', function(e) {
        area.redraw();
        donut.redraw();
    });


});