'use strict';

var tidePoolApp = {
    getTidePoolData: function() {
        $.ajax({
            method: 'GET',
            url: '/api/tidepools',
            success: function(data, status, xhr) {
                var template;
                var templateScript;

                if (status === 'success' && typeof(data) === 'object') {
                    template = $('#tidepools-template').html();
                    templateScript = Handlebars.compile(template);

                    $('#contentArea').html(templateScript(data));
                } else {
                    template = $('#error-template').html();
                    templateScript = Handlebars.compile(template);

                    $('#contentArea').html(templateScript());
                }
            },
            error: function(xhr, status, error) {
                var template = $('#error-template').html();
                var templateScript = Handlebars.compile(template);

                $('#contentArea').html(templateScript());
            }
        });
    }
};

$(document).ready(function() {
    tidePoolApp.getTidePoolData();
});