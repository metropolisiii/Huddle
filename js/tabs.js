jQuery(document).ready(function(){
    jQuery('.tabs.standard .tab-links a').on('click',function(e){
        var currentAttrValue=jQuery(this).attr('href');
        
        jQuery('.tabs '+ currentAttrValue).show().siblings().hide();
        
        jQuery(this).parent('li').addClass('active').siblings().removeClass('active');
        
        e.preventDefault();
    });
});