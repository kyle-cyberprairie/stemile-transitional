<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $title = "St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "St. Emile Church is a Roman Catholic parish in south-east Winnipeg's St. Vital neighbourhood. Mass is celebrated daily in the church or chapel.";
    $url = "https://st-emile.org/";
    return view('pages.home', compact('title', 'description', 'url'));
});
Route::get('/parish-life', function () {
    $title = "Administration - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "Come to the St. Emile parish office weekday mornings to reserve a Mass intention, register in the parish, arrange a pastoral visit, or make an appointment.";
    $url = "https://st-emile.org/parish-life";
    return view('pages.parish-life', compact('title', 'description', 'url'));
});
Route::get('/contact', function () {
    $title = "Contact Us - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "St. Emile Roman Catholic Church is a parish in the Archdiocese of St. Boniface in south-east Winnipeg's St. Vital area. Mass is celebrated daily.";
    $url = "https://st-emile.org/contact";
    return view('pages.contact', compact('title', 'description', 'url'));
});
Route::get('/docs', function () {
    $title = "Documents - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "The parish registration form, pre-authorized donation form, parish bulletins, and Liturgical Ministry guides are available here.";
    $url = "https://st-emile.org/docs";
    return view('pages.docs', compact('title', 'description', 'url'));
});
Route::get('/faqs', function () {
    $title = "Frequently-Asked Questions - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "FAQs provide directions and answer frequently-asked questions about pastoral visits, Mass intentions, the sacraments, parish contacts and activities.";
    $url = "https://st-emile.org/faqs";
    return view('pages.faqs', compact('title', 'description', 'url'));
});
Route::get('/finance', function () {
    $title = "Finance - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "Ways to contribute to St. Emile parish.";
    $url = "https://st-emile.org/finance";
    return view('pages.finance', compact('title', 'description', 'url'));
});
Route::get('/sacraments', function () {
    $title = "Attending mass at St. Emile Parish - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "Get details about Mass at St. Emile, pastoral visits for the sick and elderly, Eucharistic Adoration and a monthly Healing Mass with Anointing of the Sick.";
    $url = "https://st-emile.org/sacraments";
    return view('pages.sacraments', compact('title', 'description', 'url'));
});
Route::get('/reconciliation', function () {
    $title = "Sacrament of Reconciliation - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "The sacrament of Reconciliation (Confession) is available in St. Emile Parish twice a week or by appointment.";
    $url = "https://st-emile.org/reconciliation";
    return view('pages.reconciliation', compact('title', 'description', 'url'));
});
Route::get('/baptism', function () {
    $title = "Baptism - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "In St. Emile Parish, the sacrament of Baptism is usually celebrated one weekend a month. Parents and godparents must attend a baptismal preparation course.";
    $url = "https://st-emile.org/baptism";
    return view('pages.baptism', compact('title', 'description', 'url'));
});
Route::get('/marriage', function () {
    $title = "Marriage - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "Couples wishing to marry at St. Emile Church must notify the pastor at least six months in advance and take a diocesan marriage preparation course.";
    $url = "https://st-emile.org/marriage";
    return view('pages.marriage', compact('title', 'description', 'url'));
});
Route::get('/faith', function () {
    $title = "Faith &amp; Spiritual Growth - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "The Faith and Spiritual Growth Ministry provides opportunities for faith and spiritual growth in St. Emile Parish.";
    $url = "https://st-emile.org/faith";
    return view('pages.faith', compact('title', 'description', 'url'));
});
Route::get('/catechism', function () {
    $title = "Catechism &amp; Sacramental Preparation Classes - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "St. Emile Parish's children's catechesis is in 3 sections depending on age. It includes Sunday catechism and evening classes for sacraments of initiation.";
    $url = "https://st-emile.org/catechism";
    return view('pages.catechism', compact('title', 'description', 'url'));
});
Route::get('/men', function () {
    $title = "Men's Faith Sharing Group - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "St. Emile Parish's Men's Faith Sharing Group is open to all men and meets twice a month in the chapel.";
    $url = "https://st-emile.org/men";
    return view('pages.men', compact('title', 'description', 'url'));
});
Route::get('/rcia', function () {
    $title = "Rite of Christian Initiation of Adults - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "Learn more about the Catholic faith by attending RCIA meetings on Thursdays at 7:30 p.m. in the boardroom.Learn more about the Catholic faith by attending RCIA meetings on Thursdays at 7:30 p.m. in the boardroom.";
    $url = "https://st-emile.org/rcia";
    return view('pages.rcia', compact('title', 'description', 'url'));
});
Route::get('/word', function () {
    $title = "Word of God - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "Prepare for Mass at St. Emile Church by reading and meditating on the liturgical readings.";
    $url = "https://st-emile.org/word";
    return view('pages.word', compact('title', 'description', 'url'));
});
Route::get('/ppc', function () {
    $title = "Parish Pastoral Council - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "The Parish Pastoral Council assists and advises the pastor and is the main body for lay leadership in the pastoral life of St. Emile Parish.";
    $url = "https://st-emile.org/ppc";
    return view('pages.ppc', compact('title', 'description', 'url'));
});
Route::get('/ministries', function () {
    $title = "Ministries and Organizations - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "Serving in one of St. Emile's parish ministries or organizations is a great way to get involved in the church and to meet people.";
    $url = "https://st-emile.org/ministries";
    return view('pages.ministries', compact('title', 'description', 'url'));
});
Route::get('/calendar-1', function () {
    $title = "Parish Calendar - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "Events at St. Emile Catholic parish are provided here in calendar format.";
    $url = "https://st-emile.org/calendar-1";
    return view('pages.calendar-1', compact('title', 'description', 'url'));
});
Route::get('/news-1', function () {
    $title = "What's Happening - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "Changes to the St. Emile Mass schedule and other newsworthy information about special liturgies and events can be found here.";
    $url = "https://st-emile.org/news-1";
    return view('pages.news-1', compact('title', 'description', 'url'));
});
Route::get('/youth', function () {
    $title = "St. Emile parish Youth Group!!! - St. Emile Roman Catholic Church - Winnipeg, Manitoba";
    $description = "Join young adults at St. Emile in learning more about their faith and drawing closer to God.";
    $url = "https://st-emile.org/youth";
    return view('pages.youth', compact('title', 'description', 'url'));
});