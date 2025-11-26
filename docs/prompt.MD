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



------------------------------------------------------------------------------------------------

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
--,sum_amount
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


----------------------------------------รายงานใหม่---------------------------------------------------