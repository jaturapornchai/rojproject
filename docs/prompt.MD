# ----------------------------------------รายงานใหม่---------------------------------------------------

สร้างรายงานใหม่ โดย ไปอ่าน guide จาก ไฟล์ DEVELOPER_GUIDE.md

ชื่อรายงาน : รายงานสรุปยอดขายประจำวัน
รหัสรายงาน : SRR50003
BASE_QUERY
```
SELECT 
       doc_date,(CASE when (pos_id <> '') THEN 1 ELSE 0 END) as pos_status,(CASE when (pos_id <> '') THEN pos_id ELSE 'ขายหลังร้าน' END) as pos_id,
	   cashier_code,(select name_1 from erp_user where code=cashier_code) as cashier_name,
       SUM(Totale1) Total_cash,
	   sum(Totale9) Total_wallet,
       SUM(Totale2) Total_card,
       SUM(Totale3) Total_amount,
       SUM(Totale4) Total_1,
       SUM(Totale5) Total_2,
       SUM(Totale6) Total_3,
       SUM(Totale7) Total_s,
       SUM(Totale8) Total_d
FROM 
(
       select doc_date,pos_id,cashier_code,(select name_1 from erp_user where code=cashier_code) as cashier_name
	   
	   ---เงินสด---
	   ,(CASE when (is_pos = 1) THEN (((select cb_trans.total_net_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no)
		 +(CASE WHEN discount_word <> '' THEN discount_word::numeric ELSE 0 END))
		 -(select cb_trans.card_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no)
		 -(select cb_trans.wallet_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no)
		 ) ELSE 0 END) AS Totale1 --เงินสด
		---เงินเชื่อ--- 
              ,(CASE when (is_pos = 1) THEN (select cb_trans.card_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no) ELSE 0 END) AS Totale2
		---wallet---	  
			  ,(CASE when (is_pos = 1) THEN ( (select cb_trans.wallet_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no)
		 +(CASE WHEN discount_word <> '' THEN discount_word::numeric ELSE 0 END)
		 ) ELSE 0 END) AS Totale9 --wallet
		
		---	Total_amount---  
			  ,(CASE when (is_pos = 1) THEN (select cb_trans.total_net_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no)
			  +(CASE WHEN discount_word <> '' THEN discount_word::numeric ELSE 0 END) ELSE 0 END) AS Totale3 --Total_amount
			  
			  ,(CASE when (is_pos = 0) and (inquiry_type = 1) THEN total_amount ELSE 0 END) AS Totale4
			  ,(CASE when (is_pos = 0) and (inquiry_type = 0) THEN total_amount ELSE 0 END) AS Totale5
			  ,(CASE when (is_pos = 0) THEN total_amount ELSE 0 END) AS Totale6
			  ,(CASE when (is_pos in (0,1)) THEN (total_amount+(CASE when discount_word <> '' THEN discount_word::numeric ELSE 0 END)) ELSE 0 END) AS Totale7,
	      (CASE when discount_word <> '' THEN discount_word::numeric ELSE 0 END) as Totale8

       from  ic_trans where trans_flag = 44 and last_status = 0 and doc_date between '2025-11-01' and '2025-11-25'   ) t
GROUP BY doc_date,pos_id,cashier_code order by doc_date,pos_id,cashier_code
```
ให้เพิ่มเงือนไขให้ด้วย



# ----------------------------------------รายงานใหม่---------------------------------------------------

สร้างรายงานใหม่ โดย ไปอ่าน guide จาก ไฟล์ DEVELOPER_GUIDE.md

ชื่อรายงาน : รายงานเปรียบเทียบราคาขาย
รหัสรายงาน : SRR40010
BASE_QUERY
```
with balance_cost as(
select ic_code, ic_name, ic_unit_code, balance_qty/unit_standard_ratio as balance_qty, average_cost*unit_standard_ratio as average_cost, average_cost_end
, balance_amount
from (select coalesce((select stand_value/divide_value 
from ic_unit_use 
where ic_unit_use.ic_code=temp2.ic_code and ic_unit_use.code=temp2.ic_unit_code),1) as unit_standard_ratio,ic_code, ic_name, balance_qty, ic_unit_code
, case when balance_qty=0 then 0 else balance_amount/balance_qty end as average_cost
, coalesce(((select  average_cost from ic_trans_detail where ic_trans_detail.last_status=0  and ic_trans_detail.item_code=temp2.ic_code and doc_date_calc<='2025-11-25' 
and ((trans_flag in (70,54,60,58,310,12) or (trans_flag=66 and (qty>0 or sum_of_cost>0 )) or (trans_flag=14) or (trans_flag=48 and inquiry_type < 2)) 
	or (trans_flag in (56,68,72,44) or (trans_flag=66 and (qty<0 or sum_of_cost<0 )) or (trans_flag=46)  or (trans_flag=16 ) or (trans_flag=311 )) 
	and not (ic_trans_detail.doc_ref <> '' and ic_trans_detail.is_pos = 1)) order by doc_date_calc desc,doc_time desc ,line_number desc  offset 0 limit 1 )*unit_ratio),0) as average_cost_end
,  balance_amount as balance_amount
from (select ic_code, ic_name, balance_qty, ic_unit_code, (select unit_standard_stand_value/unit_standard_divide_value from ic_inventory where ic_inventory.code=temp1.ic_code) as unit_ratio, balance_amount

from (select item_code as ic_code, (select name_1 from ic_inventory where ic_inventory.code=item_code) as ic_name
, (select unit_standard from ic_inventory where ic_inventory.code=item_code) as ic_unit_code
, coalesce(sum(calc_flag*(case when ((trans_flag in (70,54,60,58,310,12) or (trans_flag=66 and qty>0) or (trans_flag=14 and inquiry_type=0) or (trans_flag=48 and inquiry_type < 2)) or (trans_flag in (56,68,72,44) 
	or (trans_flag=66 and qty<0) or (trans_flag=46 and inquiry_type in (0,2))  or (trans_flag=16 and inquiry_type in (0,2)) or (trans_flag=311 and inquiry_type=0)) 
	and not (ic_trans_detail.doc_ref <> '' and ic_trans_detail.is_pos = 1)) then qty*(stand_value / divide_value) else 0 end)),0) as balance_qty
, coalesce(sum( (calc_flag*(case when ((trans_flag in (70,54,60,58,310,12) or (trans_flag=66 and (qty>0 or sum_of_cost>0 )) or (trans_flag=14) or (trans_flag=48 and inquiry_type < 2)) or (trans_flag in (56,68,72,44) 
	or (trans_flag=66 and (qty<0 or sum_of_cost<0 )) or (trans_flag=46)  or (trans_flag=16 ) or (trans_flag=311 )) and not (ic_trans_detail.doc_ref <> '' and ic_trans_detail.is_pos = 1)) then case when trans_flag=66 and qty < 0 
	then -1* sum_of_cost_1 else sum_of_cost_1 end else 0 end))+coalesce(profit_lost_cost_amount, 0)),0) as balance_amount

from ic_trans_detail where ic_trans_detail.last_status=0  and ic_trans_detail.item_type<>5  and (select item_type from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) not in (1,3)  
and doc_date_calc<='2025-11-25' 
group by item_code) as temp1) as temp2  
where  ( balance_qty<>0 or balance_amount<>0)) as final 
order by ic_code

)
----------------------

select doc_date,doc_no,cust_name,sale_name,item_code,item_name,qty,unit_code,price,discount
,case when price_cust <> 0 then price_cust else price_cust_unit end as price_cust
,price-coalesce(case when price_cust <> 0 then price_cust else price_cust_unit end,0) as diff
,average_cost
,(price-coalesce(case when price_cust <> 0 then price_cust else price_cust_unit end,0))*qty as sum_amount
,remark
from
(
select doc_date,doc_no,cust_name,sale_name,item_code,item_name,qty,unit_code,price,discount,sum_amount,price_cust,price_cust_unit
,(select average_cost from balance_cost where temp1.item_code = balance_cost.ic_code) as average_cost
,remark 
from(
select doc_date,doc_no,concat(cust_code,'~',(select name_1 from ar_customer where ar_customer.code = ic_trans_detail.cust_code)) as cust_name

,concat(
	case when (select sale_code from ic_trans where ic_trans.doc_no = ic_trans_detail.doc_no and ic_trans.trans_flag = ic_trans_detail.trans_flag) is null then 
	(select creator_code from ic_trans where ic_trans.doc_no = ic_trans_detail.doc_no and ic_trans.trans_flag = ic_trans_detail.trans_flag)
	else 
	(select sale_code from ic_trans where ic_trans.doc_no = ic_trans_detail.doc_no and ic_trans.trans_flag = ic_trans_detail.trans_flag) end
	,'~',
	(select name_1 from erp_user where erp_user.code = case when (select sale_code from ic_trans where ic_trans.doc_no = ic_trans_detail.doc_no and ic_trans.trans_flag = ic_trans_detail.trans_flag) is null then 
	(select creator_code from ic_trans where ic_trans.doc_no = ic_trans_detail.doc_no and ic_trans.trans_flag = ic_trans_detail.trans_flag)
	else 
	(select sale_code from ic_trans where ic_trans.doc_no = ic_trans_detail.doc_no and ic_trans.trans_flag = ic_trans_detail.trans_flag) end)
	
) as sale_name 


,item_code,item_name,qty,unit_code,price,discount,sum_amount
,coalesce(case when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 0
	then to_number((select price_0 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 1
	then to_number((select price_1 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 2
	then to_number((select price_2 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 3
	then to_number((select price_3 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 4
	then to_number((select price_4 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 5
	then to_number((select price_5 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 6
	then to_number((select price_6 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 7
	then to_number((select price_7 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 8
	then to_number((select price_8 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 9
	then to_number((select price_9 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
else '0' end , 0) as price_cust
,coalesce(case when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 0
	then to_number((select price_0 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 1
	then to_number((select price_1 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 2
	then to_number((select price_2 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 3
	then to_number((select price_3 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 4
	then to_number((select price_4 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 5
	then to_number((select price_5 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 6
	then to_number((select price_6 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 7
	then to_number((select price_7 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 8
	then to_number((select price_8 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 9
	then to_number((select price_9 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
else '0' end , 0)*(select stand_value from ic_unit_use where ic_unit_use.ic_code = ic_trans_detail.item_code and ic_unit_use.code = ic_trans_detail.unit_code limit 1) as price_cust_unit
,(select remark from ic_trans where ic_trans.doc_no = ic_trans_detail.doc_no and ic_trans.trans_flag = ic_trans_detail.trans_flag) as remark
from ic_trans_detail 
where trans_flag = 44 and last_status = 0 and doc_date between '2025-11-01' and '2025-11-25'
    
order by doc_date,doc_no
) as temp1 
) as temp2 
where case when 0 = 0 then (price-coalesce(case when price_cust <> 0 then price_cust else price_cust_unit end,0)) <> 0
	when 0=1 then (price-coalesce(case when price_cust <> 0 then price_cust else price_cust_unit end,0)) > 0
	when 0=2 then (price-coalesce(case when price_cust <> 0 then price_cust else price_cust_unit end,0)) < 0
	else 1=1 end
```
ให้เพิ่มเงือนไขให้ด้วย
(ตอบเป็นภาษาไทย)

# ----------------------------------------รายงานใหม่---------------------------------------------------

สร้างรายงานใหม่ โดย ไปอ่าน guide จาก ไฟล์ DEVELOPER_GUIDE.md โดยทำทีละ phase

ชื่อรายงาน : รายงานยกเลิกขายสินค้าและบริการ แยกสาขา
รหัสรายงาน : B4029
QUERY
```
select branch_code,(select name_1 from erp_branch_list where code = branch_code) as "sync_branch_list.branch_name",doc_date ,doc_no ,doc_ref_date ,doc_ref ,cust_code ,cust_name 
 from (select branch_code,(select name_1 from erp_branch_list where code = branch_code) as "sync_branch_list.branch_name"
	   ,cust_code,(select name_1 from ar_customer where ic_trans.cust_code=ar_customer.code) as cust_name
	   ,total_value,total_discount,total_value - total_discount as total_after_discount,total_vat_value,total_except_vat
	   ,doc_date,doc_no,doc_time,cashier_code,doc_ref_date,doc_ref,total_amount,total_before_vat,vat_type,vat_rate,last_status as _def_last_status
	   ,cast(last_status as varchar)||','||cast(used_status as varchar)||','||cast(doc_success as varchar)||','||cast(not_approve_1 as varchar)||','||cast(on_hold as varchar)||','||cast(approve_status as varchar)||','||cast(expire_status  as varchar) as last_status 
	   from ic_trans 
	   where trans_flag in(45)  and doc_date between '2025-11-01' and '2025-11-27' 
   and last_status=0) as temp1 order by branch_code,doc_date,doc_no
```
ให้เพิ่มเงือนไขในการเรียกรายงานคือ
1.ช่วงวันที่
2.ลูกค้า (เหมือนรายงาน SRR40010)
3.สาขา

(ตอบเป็นภาษาไทย)

# ----------------------------------------รายงานใหม่---------------------------------------------------

สร้างรายงานใหม่ โดย ไปอ่าน guide จาก ไฟล์ DEVELOPER_GUIDE.md โดยทำทีละ phase

ชื่อรายงาน : รายงานสินค้าใหม่ แสดงระดับราคา
รหัสรายงาน : SRR20011
QUERY : 
```
select code,name_1,(select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code) as unit_standard,
(select ic_group.name_1 from ic_group where ic_group.code=(select ic_inventory.group_main from ic_inventory where ic_inventory.code=master_logs.code)) as item_group,
(select price_0 from ic_inventory_price_formula where ic_code=code and ic_inventory_price_formula.unit_code=(select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code)) as p1,
(select price_1 from ic_inventory_price_formula where ic_code=code and ic_inventory_price_formula.unit_code=(select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code)) as p2,
(select price_2 from ic_inventory_price_formula where ic_code=code and ic_inventory_price_formula.unit_code=(select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code)) as p3,
(select price_3 from ic_inventory_price_formula where ic_code=code and ic_inventory_price_formula.unit_code=(select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code)) as p4,
(select price_4 from ic_inventory_price_formula where ic_code=code and ic_inventory_price_formula.unit_code=(select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code)) as p5,
(select price_5 from ic_inventory_price_formula where ic_code=code and ic_inventory_price_formula.unit_code=(select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code)) as p6,
(select price_6 from ic_inventory_price_formula where ic_code=code and ic_inventory_price_formula.unit_code=(select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code)) as p7,
concat(user_code,' ~ ',(select name_1 from erp_user where code=user_code)) as user_text,
date_time,computer_name ,DATE(create_date_time_now) as create_date
from master_logs
where function_code in (1) and (select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code) <> '' and DATE(date_time) between DATE('2025-01-01') and DATE('2025-11-28') 
```
ให้เพิ่มเงือนไขในการเรียกรายงานคือ
1.ช่วงวันที่
2.สินค้า ( Query : select code,name_1,unit_cost from ic_inventory order by code)
3.กลุ่มสินค้า ( Query : select code,name_1 from ic_group order by code )
4.ยี่ห้อสินค้า ( Query : select code,name_1 from ic_brand order by code )

(ตอบเป็นภาษาไทย)

# ----------------------------------------รายงานใหม่---------------------------------------------------

สร้างรายงานใหม่ โดย ไปอ่าน guide จาก ไฟล์ DEVELOPER_GUIDE.md โดยทำทีละ phase
(ตอบเป็นภาษาไทย)

ชื่อรายงาน : รายงานเปรียบเทียบต้นทุนการซื้อล่าสุด
รหัสรายงาน : SRR30003
QUERY : 
```
select doc_date,doc_no,item_code, item_name, qty, unit_code, average_cost,( select average_cost from ic_trans_detail as x where x.last_status = 0 and  x.trans_flag = 12 and x.item_code  = ic_trans_detail.item_code and x.doc_date <= ic_trans_detail.doc_date and x.doc_no < ic_trans_detail.doc_no  order by doc_no  desc ,doc_date, doc_time limit 1 )  as last_cost ,
(average_cost-( select average_cost from ic_trans_detail as x where x.last_status = 0 and  x.trans_flag = 12 
and x.item_code  = ic_trans_detail.item_code and x.doc_date <= ic_trans_detail.doc_date and x.doc_no < ic_trans_detail.doc_no  order by doc_no  desc ,doc_date, doc_time limit 1 )) as diff_cost  
 from ic_trans_detail where doc_date between '2025-11-28' and '2025-11-28' and trans_flag = 12      
and average_cost <> ( select average_cost from ic_trans_detail as x where x.last_status = 0 and  x.trans_flag = 12 and x.item_code  = ic_trans_detail.item_code and x.doc_date <= ic_trans_detail.doc_date and x.doc_no < ic_trans_detail.doc_no  order by doc_no  desc ,doc_date, doc_time limit 1 )  
 order by doc_date,doc_no,item_code
```

ให้เพิ่มเงือนไขในการเรียกรายงานคือ
1.ช่วงวันที่
2.เลขที่เอกสาร ( Query : select doc_date,doc_no,(ic_trans.cust_code ||'~' || (select name_1 from ap_supplier where ap_supplier.code=ic_trans.cust_code)) as cust_name, total_amount , remark from ic_trans where trans_flag = 12 order by doc_date,doc_no )
3.กลุ่มสินค้า ( Query : select code,name_1 from ic_group order by code )
4.ยี่ห้อสินค้า ( Query : select code,name_1 from ic_brand order by code )
5.สินค้า ( Query : select code,name_1,unit_cost from ic_inventory order by code)
6.คลัง ( Query : select code,name_1 from ic_warehouse order by code )
7.พื้นที่เก็บ ( Query : select code,name_1 from ic_shelf order by code )

รายงานให้แสดงคอลั่ม ดังนี้
1.เอกสารวันที่ = doc_date
2.เอกสารเลขที่ = doc_no
3.รหัสสินค้า = item_code
4.ชื่อสินค้า = item_name
5.จำนวน = qty
6.หน่วยนับ = unit_code
7.ราคาทุน = average_cost
8.ต้นทุนก่อนหน้า = last_cost
9.ผลต่าง = diff_cost

# ----------------------------------------รายงานใหม่---------------------------------------------------

สร้างรายงานใหม่ โดย ไปอ่าน guide จาก ไฟล์ DEVELOPER_GUIDE.md โดยทำทีละ phase
(ตอบเป็นภาษาไทย)

ชื่อรายงาน : รายงานจัดอันดับยอดขาย-ตามกลุ่มสินค้า
รหัสรายงาน : SRR40006
QUERY : 
```
with balance as(
select ic_code, ic_name, ic_unit_code,wh_code, balance_qty/unit_standard_ratio as balance_qty
from (select coalesce((select stand_value/divide_value from ic_unit_use where ic_unit_use.ic_code=temp2.ic_code and ic_unit_use.code=temp2.ic_unit_code),1) as unit_standard_ratio
	  ,ic_code, ic_name,wh_code, balance_qty, ic_unit_code
	  from (select ic_code, ic_name,wh_code, balance_qty, ic_unit_code, (select unit_standard_stand_value/unit_standard_divide_value from ic_inventory where ic_inventory.code=temp1.ic_code) as unit_ratio
			from (select item_code as ic_code,wh_code, (select name_1 from ic_inventory where ic_inventory.code=item_code) as ic_name
				  , (select unit_standard from ic_inventory where ic_inventory.code=item_code) as ic_unit_code
				  , coalesce(sum(calc_flag*(case when ((trans_flag in (70,54,60,58,310,12) or (trans_flag=66 and qty>0) or (trans_flag=14 and inquiry_type=0) or (trans_flag=48 and inquiry_type < 2)) 
														 or (trans_flag in (56,68,72,44) or (trans_flag=66 and qty<0) or (trans_flag=46 and inquiry_type in (0,2))  or (trans_flag=16 and inquiry_type in (0,2)) or (trans_flag=311 and inquiry_type=0)) 
														 and not (ic_trans_detail.doc_ref <> '' and ic_trans_detail.is_pos = 1)) 
											  then qty*(stand_value / divide_value) else 0 end)),0) as balance_qty
				  from ic_trans_detail 
				  where ic_trans_detail.last_status=0  and ic_trans_detail.item_type<>5 and ic_trans_detail.is_doc_copy =0
				  and (select item_type from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) not in (1,3)  
				  and doc_date_calc<='2025-11-28' 
				  group by item_code,wh_code
				 ) as temp1
		   ) as temp2  
) as final 
order by ic_code
)

select row_number() over (ORDER BY wh_code,qty desc ,item_code)as rownum,item_code,item_name,unit_code,qty,sum_amount,sum_of_cost,
(sum_amount-sum_of_cost) as Profit_lost
,(case when (sum_amount-sum_of_cost) is null or (sum_amount-sum_of_cost)=0 then 0 
 	else round((sum_amount-sum_of_cost)*100/case when sum_of_cost is null or sum_of_cost=0 then (sum_amount-sum_of_cost) else sum_of_cost end,2)end)as percent_1
,(case when (sum_amount-sum_of_cost) is null or (sum_amount-sum_of_cost)=0 or (sum_amount-sum_of_cost)=sum_amount then 0 
 else round((sum_amount-sum_of_cost)*100/case when sum_amount is null or sum_amount=0 then (sum_amount-sum_of_cost) else sum_amount end,2)end)as percent_2
,(select name_1 from ic_warehouse where A.wh_code = ic_warehouse.code )as wh_code
,(select name_1 from ic_shelf where A.shelf_code = ic_shelf.code and A.wh_code = ic_shelf.whcode ) as shelf_code
,group_main
,(select name_1 from ic_group where A.group_main = ic_group.code) as group_name
,(select balance_qty from balance where balance.ic_code = A.item_code and balance.wh_code = '01') as wh_01
,(select balance_qty from balance where balance.ic_code = A.item_code and balance.wh_code = '02') as wh_02
,(select balance_qty from balance where balance.ic_code = A.item_code and balance.wh_code = '97') as wh_97
,(select balance_qty from balance where balance.ic_code = A.item_code and balance.wh_code = '98') as wh_98
,(select balance_qty from balance where balance.ic_code = A.item_code and balance.wh_code = '99') as wh_99
from (select item_code,
(select group_main from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) as group_main,
coalesce((select name_1 from ic_inventory where code=item_code),'') as item_name,unit_code,
coalesce(sum(qty),0) as qty,
coalesce(sum(sum_amount),0) as sum_amount,
coalesce(sum(sum_of_cost),0) as sum_of_cost,
wh_code,shelf_code
 
from ic_trans_detail 
where doc_date between '2025-11-01' and '2025-11-28' and trans_flag=44 and last_status=0   
and exists(select code from ic_inventory where ic_inventory.code = ic_trans_detail.item_code )
	  group by item_code,unit_code,wh_code,shelf_code,group_main
) as A
```

ให้เพิ่มเงือนไขในการเรียกรายงานคือ
1.ช่วงวันที่
2.กลุ่มสินค้า ( Query : select code,name_1 from ic_group order by code )
3.คลัง ( Query : select code,name_1 from ic_warehouse order by code )
4.ยี่ห้อสินค้า ( Query : select code,name_1 from ic_brand order by code )

รายงานให้แสดงคอลั่ม ดังนี้
1.คลัง = wh_code
2.พื้นที่เก็บ = shelf_code
3.ลำดับ = rownum
4.รหัสสินค้า = item_code
5.ชื่อสินค้า = item_name
6.ชื่อกลุ่มสินค้า = group_name
7.จำนวน = qty
8.หน่วยนับ = unit_code
9.คลัง 1 = wh_01
10.คลัง 2 = wh_02
11.คลัง 97 = wh_97
12.คลัง 98 = wh_98
13.คลัง 99 = wh_99
14.รวมมูลค่า = sum_amount

**PDF ให้ทำเป็น level โดย level 1 ใช้ wh_code , shelf_code ( ดูตัวอย่างรายงาน b4029)

# ----------------------------------------รายงานใหม่---------------------------------------------------

สร้างรายงานใหม่ โดย ไปอ่าน guide จาก ไฟล์ DEVELOPER_GUIDE.md โดยทำทีละ phase
(ตอบเป็นภาษาไทย)

ชื่อรายงาน : รายงานราคาสินค้าเปลี่ยนแปลง
รหัสรายงาน : SRR20016
QUERY : 
```
with data_raw as (
	select rownum,
 create_date_time_now, doc_date_new, doc_time_new, 
 item_code, unit_code_old,unit_code_new, user_code
	, old_price_0,new_price_0
	,(select date(doc_date_new) from price_log b where b.item_code = price_log.item_code and price_log.rownum < b.rownum order by rownum limit 1 offset 0) as doc_date_old
	,(select doc_time_new from price_log b where b.item_code = price_log.item_code and price_log.rownum < b.rownum order by rownum limit 1 offset 0) as doc_time_old
 , (
  'ราคากลาง' || ':' || old_price_0 || ':' || new_price_0 || ',' || 
  'ราคาที่ 1' || ':' || old_price_1 || ':' || new_price_1 || ',' || 
  'ราคาที่ 2' || ':' || old_price_2 || ':' || new_price_2 || ',' || 
  'ราคาที่ 3' || ':' || old_price_3 || ':' || new_price_3 || ',' || 
  'ราคาที่ 4' || ':' || old_price_4 || ':' || new_price_4 || ',' || 
  'ราคาที่ 5' || ':' || old_price_5 || ':' || new_price_5 || ',' || 
  'ราคาที่ 6' || ':' || old_price_6 || ':' || new_price_6 || ',' || 
  'ราคาที่ 8' || ':' || old_price_7 || ':' || new_price_7 || ',' || 
  'ราคาที่ 7' || ':' || old_price_8 || ':' || new_price_8 || ',' || 
  'ราคาที่ 9' || ':' || old_price_9 || ':' || new_price_9) as price_text
,row_number() OVER (PARTITION BY item_code ORDER BY item_code, create_date_time_now DESC) as line_number
 from price_log
	where date(create_date_time_now) between '2025-11-01' and '2025-12-04'
	order by create_date_time_now
)
	
, data_mix_column as (
 select rownum,create_date_time_now, doc_date_new, doc_time_new ,doc_date_old ,doc_time_old
	, item_code ,  unit_code_old,unit_code_new, user_code
	, old_price_0,new_price_0
	, unnest(string_to_array(price_text, ',')) as price_text_str 
	from data_raw
)
	
, change_data as (
 select  rownum,create_date_time_now, doc_date_new, doc_time_new ,doc_date_old ,doc_time_old
	, item_code  , unit_code_old,unit_code_new, user_code
	, old_price_0,new_price_0
 , (string_to_array(price_text_str, ':'))[1] as price_tag
 , (string_to_array(price_text_str, ':'))[2] as old_data
 , (string_to_array(price_text_str, ':'))[3] as new_data
 from data_mix_column
)

, data_detail as (
select row_number() over (PARTITION BY item_code,unit_code_old ORDER BY item_code,unit_code_old,create_date_time_now,price_tag)as rownumber
	,row_number() over (PARTITION BY item_code,rownum ORDER BY item_code,unit_code_old,create_date_time_now,price_tag)as line_number
	,* 
, (SELECT real_price FROM calc_formula_price(1, (COALESCE(NULLIF(old_price_0, ''), '0')::numeric), old_data)) as old_amount	
, (SELECT real_price FROM calc_formula_price(1, (COALESCE(NULLIF(new_price_0, ''), '0')::numeric), new_data)) as new_amount	
	
	from change_data 
	where ( case when coalesce(old_data,'') = '' then '0' else old_data end ) != ( case when coalesce(new_data,'') = '' then '0' else new_data end )  
order by item_code,unit_code_old,create_date_time_now,price_tag
	)
	

, detail_final as  (
select --case when d.rownum = 1 then d.item_code else '' end as item_code
	1 as sort,d.rownumber,d.line_number,d.rownum,d.item_code
	,ic.name_1,d.unit_code_old,d.unit_code_new
	,coalesce((select name_1 from ic_group where ic_group.code = ic.group_main),'') as group_main
	,coalesce((select name_1 from ic_brand where ic_brand.code = ic.item_brand),'') as item_brand
	,d.price_tag
	,d.old_data,d.old_amount
	,d.doc_date_old,d.doc_time_old
	,d.new_data,d.new_amount
	,date(d.doc_date_new) as doc_date_new,doc_time_new
	,(d.new_amount-d.old_amount) as diff_amount
	,case when d.old_amount = 0 then 100 else round(((d.new_amount-d.old_amount)*100)/d.old_amount,2) end as per_diff_amount
	,concat(user_code,'~',(select name_1 from erp_user where erp_user.code = d.user_code)) as user_name
	--,pl.count_item
	,d.create_date_time_now
from data_detail as d
left join ic_inventory as ic on ic.code = d.item_code
--left join pl on pl.item_code = d.item_code 
where (coalesce(d.unit_code_old,'') <> '' /*and pl.count_item > 1*/ )
  
order by d.item_code,d.rownum,d.rownumber
)

/*, pl as (
select item_code,count(item_code) as count_item
from(
select rownum,item_code 
from detail_final 
group by item_code,rownum
) as temp_pl
group by item_code
)
*/

-------------------------------------

select sort,rownum,item_code,rownumber,
CASE WHEN line_number = 1 THEN DENSE_RANK() OVER ( ORDER BY doc_date_new,doc_time_new,item_code,rownum desc) ELSE 0 END AS line_num 
,case when rownum >= 1 and sort = 1 then doc_date_new else null end as doc_date_new
,case when rownum >= 1 and sort = 1 then doc_time_new else '' end as doc_time_new
,doc_date_old,doc_time_old
,case when rownum >= 1 and sort = 1 then item_code else '' end as ic_code
,case when rownum >= 1 and sort = 1 then name_1 when rownumber = 0 and sort = 2 then '' else '' end as name_1
,case when rownum >= 1 and sort = 1 then unit_code_new else '' end as unit_code_new
,case when rownum >= 1 and sort = 1 then group_main else '' end as group_main
,case when rownum >= 1 and sort = 1 then item_brand else '' end as item_brand
,price_tag
,old_amount
,new_amount
,diff_amount
,per_diff_amount
,user_name
--,count_item
from(
select df.sort ,df.rownumber,df.line_number,df.rownum,df.item_code,df.name_1,df.unit_code_old,df.unit_code_new,df.group_main,df.item_brand,df.price_tag,df.old_data,df.old_amount,df.doc_date_old,df.doc_time_old
	,df.new_data,df.new_amount,df.doc_date_new,df.doc_time_new,df.diff_amount,df.per_diff_amount,df.user_name
	--,pl.count_item
	,df.create_date_time_now
	from detail_final as df
	--left join pl on pl.item_code = df.item_code

union all
select 2 as sort,0 as rownumber,0 as line_number, rownum,item_code,'' as name_1, '' as unit_code_old , '' as unit_code_new,'' as group_main , '' as item_brand, '.' as price_tag 
	, '' as old_data, 0 as old_amount, null as doc_date_old, '' as doc_time_old
,'' as new_data,0 as new_amount,doc_date_new,doc_time_new,0 as diff_amount,0 as per_diff_amount, '' as user_name/*,0 as count_item*/,null as create_date_time_now
from detail_final
	group by rownum,item_code,doc_date_new,doc_time_new
) as final

order by final.doc_date_new,final.doc_time_new,item_code,rownum desc,sort,rownumber
```

ให้เพิ่มเงือนไขในการเรียกรายงานคือ
1.ช่วงวันที่
2.สินค้า ( Query : select code,name_1,unit_cost from ic_inventory order by code)
3.กลุ่มสินค้า ( Query : select code,name_1 from ic_group order by code )
4.ยี่ห้อสินค้า ( Query : select code,name_1 from ic_brand order by code )

รายงานให้แสดงคอลั่ม ดังนี้
1.ลำดับ = line_num
2.วันที่ (ล่าสุด) = doc_date_new
3.เวลา (ล่าสุด) = doc_time_new
4.วันที่ (ก่อนหน้า) = doc_date_old
5.เวลา (ก่อนหน้า) = doc_time_old
6.รหัส = ic_code
7.ชื่อ = name_1
8.หน่วยนับ = unit_code_new
9.กลุ่มสินค้า = group_main
10.ยี่ห้อ = item_brand
11.ช่องราคา = price_tag
12.ราคาก่อนหน้า = old_amount
13.ราคาล่าสุด = new_amount
14.เปลี่ยนแปลง (บาท) = diff_amount
15.เปลี่ยนแปลง (%) = per_diff_amount
16.พนักงานทำรายการ = user_name

**PDF ให้ทำเป็น level โดย level 1 ใช้ line_num,doc_date_new,doc_time_new,doc_date_old,doc_time_old,ic_code,name_1,unit_code_new,group_main,item_brand,user_name ( ดูตัวอย่างรายงาน b4029)
# ----------------------------------------รายงานใหม่---------------------------------------------------