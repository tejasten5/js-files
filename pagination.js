
    $(document).ready(function () {
        load_data(1, null);
        set_filters()
    })
    
    function set_filters() {
        $(".select2").select2();
        $(".select2-product-type").select2({
            placeholder: "Select a vendor",
            ajax: {
                url: '/ajax/vendors-select/',
                datatype: 'json'
            }
        });
    }
    
    
    
    function load_data(currentPage, key) {
       
        if (key) {
            data = { 'page': currentPage, 'filter_key': key }
        }
        else {
            data = { 'page': currentPage }
        }
        
        $('.preloader').removeAttr('style');
        $('.preloader').fadeIn('slow'); 
    
        
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: "/load/products/",
            data: data,
            success: function (data) {
                
                design_html(data.data)
                design_pagination(data.total_pages);
            },
            error: function (data) {           
                $.confirm({ 
                    title: 'Error !',              
                    content:'There was a problem.Report to technical team',               
                    type: 'Red',
                    typeAnimated: true,
                    buttons: {
                        ok: {
                            text: 'Ok',
                            btnClass: 'btn-red',
                            action: function(){
                                
                            }
                        },
                       
                    }
                });          
            }
        })
        $('.preloader').fadeOut('slow');
    
    }
    
    
    function get_search_record(val) {
        $('#product_data').html('')
        $.ajax({
            type: 'GET',
            url: '/products/product_search/',
            data: { 'vendor': val },
            success: function (data) {
    
                design_html(data)
                design_pagination(data.total_pages);
            },
            error: function (data) {
                design_html([])
                design_pagination([]);
            }
        })
    }
    
    
    
    function design_html(data) {
        
        let html1 = ''
        if (data.length == 0) {
            html1 = 'No records!'
        }
        else {
            update_access = has_Url_access('accounts:product-update');
            delete_access = has_Url_access('products:product-delete');
            product_details_access = has_Url_access('accounts:product-details');
            $.each(data, function (index, value) {
    
    
                id = value.id
                description = value.description
                title = value.title
                image = value.image
                slug = value.slug
                price = value.price
                update_product = update_access ? `<a href="/product/update/${slug}" data-edit-id="${id}"  class="bg-info"><i class="ti-marker-alt"></i></a>`: '';
                delete_product = delete_access ? `<a href="javascript:void(0)" class="bg-danger delete_link" data-delete-id="${id}"><i  data-delete-id="${id}" class="ti-trash"></i></a>`: '';
                product_detail = product_details_access ? `<a href="/product/${slug}" data-view-id="${id}" class="bg-success"><i class="icon-eye"></i></a>`: '';
                html = ` 
                    <div class="col-lg-3 col-md-6 infinite-item" >
                    <div class="card">
                        <div class="card-body">
                            <div class="product-img">
                            <img src="${image}" class="image-width">
                                <div class="pro-img-overlay">
                                    ${update_product}
                                    ${delete_product}
                                    ${product_detail}
                                </div>
                            </div>
                            <div class="product-text">
                                <span class="pro-price bg-primary"><i class="mdi mdi-currency-inr"></i>${price}</span>
                                <h5 class="card-title m-b-0" title="${title}">${title}</h5>                           
                            </div>
                        </div>
                    </div>
                </div>            
                `
                html1 += html
            })
        }
        $('#product_data').html(html1)
    }
    
    function reset_btn() {
        $('.select2-product-type').val(null).trigger('change');
        search_value = null
    ///    load_data(1, null);
    
    
    }
    
    
    var currentPage = 1;
    var pageObj = {};
    var global_last_page ;
    function design_pagination(total) {
        global_last_page = total
        let design1 = '';
        pageObj = GetPager(total, currentPage);
        console.log("pageObj::", pageObj);
        for (let i = 0; i < pageObj.pages.length; i++) {
    
            design = `        
            <div>                       
                <button class="page-link data_css" onclick="design_pagination1(${pageObj.pages[i]},this)">${pageObj.pages[i]} <span class="sr-only">(current)</span></button>           
            </div>      
            `
            design1 += design
        }
        btn_nxt = `<button class="page-link btn_nxt" onclick="next()" >Next<span class="sr-only">(current)</span></button>`
        btn_prev = `<button class="page-link btn_prv" onclick="prev()" >Previous<span class="sr-only">(current)</span></button>`
    
        btn_first = `<button class="page-link btn_first" onclick="first()" >First<span class="sr-only">(current)</span></button>`
        btn_last = `<button class="page-link btn_last" onclick="last()" >Last<span class="sr-only">(current)</span></button>`
    
        $('.page_end').html(design1)
        $('.btn_nxt').html(btn_nxt)
        $('.btn_prev').html(btn_prev)
    
        $('.btn_first').html(btn_first)
        $('.btn_last').html(btn_last)
      
    
    
    }
    $('#vendor_filter').change(function () {
        val = $(this).val();
        search_value = val;
        
        currentPage = 1
        load_data(currentPage, val)
    })
    
    $(document).on('click', '.delete_link', function () {
        delete_id = $(this).attr('data-delete-id')
    
        $.confirm({
            icon: 'fa fa-exclamation-triangle',
            title: 'Are you sure?',
            content: '',
            type: 'red',
            typeAnimated: true,
            buttons: {
                tryAgain: {
                    text: 'Delete',
                    btnClass: 'btn-red',
                    action: function () {
                        $.ajax({
                            type: 'POST',
                            url: '/products/product_delete/',
                            data: { 'selected_product[]': [delete_id] },
                            success: function (data) {
                                
                                if(data.success == 1){
                                    $.alert({
                                        title: '',
                                        content: 'This product has order !',
                                    });
                                }
                                if(data.success == 2){
                                    $.alert({
                                        title: 'Deleted',
                                        content: 'Product Deleted!',
                                    });
                                }                           
                                load_data(1, null);
    
                            },
                            error: function (data) {
                                
                                $.alert({
                                    title: 'Error !',
                                    content: 'Please contact techinical team !',
                                });
                            }
                        })
                    }
                },
                close: function () {
                }
            }
        });
    })
    
