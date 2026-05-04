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
    return view('pages.docs');
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
    return view('pages.reconciliation');
});
Route::get('/baptism', function () {
    return view('pages.baptism');
});
Route::get('/marriage', function () {
    return view('pages.marriage');
});
Route::get('/faith', function () {
    return view('pages.faith');
});
Route::get('/catechism', function () {
    return view('pages.catechism');
});
Route::get('/men', function () {
    return view('pages.men');
});
Route::get('/rcia', function () {
    return view('pages.rcia');
});
Route::get('/word', function () {
    return view('pages.word');
});
Route::get('/ppc', function () {
    return view('pages.ppc');
});
Route::get('/ministries', function () {
    return view('pages.ministries');
});
Route::get('/calendar-1', function () {
    return view('pages.calendar-1');
});
Route::get('/news-1', function () {
    return view('pages.news-1');
});