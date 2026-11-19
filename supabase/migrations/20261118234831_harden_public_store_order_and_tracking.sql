-- Keep customer-facing order/tracking RPCs callable only by the anonymous website role.
-- Aggregate repeated product IDs before validating stock to prevent duplicate-line bypass.
create or replace function public.place_store_order(
  p_customer_name text,
  p_phone text,
  p_delivery_address text,
  p_notes text,
  p_items jsonb
)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_order_id uuid := gen_random_uuid();
  v_order_number text;
  v_total numeric := 0;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
  v_total_qty integer;
begin
  if length(trim(coalesce(p_customer_name,''))) < 2
     or length(trim(coalesce(p_phone,''))) < 6
     or length(trim(coalesce(p_delivery_address,''))) < 5 then
    raise exception 'يرجى إدخال الاسم والهاتف وعنوان التوصيل بشكل صحيح';
  end if;
  if jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) < 1
     or jsonb_array_length(p_items) > 20 then
    raise exception 'قائمة المنتجات غير صالحة';
  end if;
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if coalesce(v_item->>'product_id','') = '' then
      raise exception 'معرّف المنتج غير صالح';
    end if;
    v_qty := (v_item->>'quantity')::integer;
    if v_qty < 1 or v_qty > 10 then
      raise exception 'كمية المنتج غير صالحة';
    end if;
    select coalesce(sum((x->>'quantity')::integer),0)::integer
      into v_total_qty
      from jsonb_array_elements(p_items) as items(x)
      where x->>'product_id' = v_item->>'product_id';
    if v_total_qty > 10 then
      raise exception 'إجمالي كمية المنتج يتجاوز الحد المسموح';
    end if;
    select * into v_product from public.products
      where id = (v_item->>'product_id')::uuid and is_active = true for update;
    if not found then raise exception 'أحد المنتجات لم يعد متاحاً'; end if;
    if v_product.stock_quantity < v_total_qty then
      raise exception 'الكمية المطلوبة غير متوفرة: %', v_product.name_ar;
    end if;
    v_total := v_total + (v_product.price * v_qty);
  end loop;
  insert into public.store_orders(id,customer_name,phone,delivery_address,notes,total_amount,status)
  values(v_order_id,trim(p_customer_name),trim(p_phone),trim(p_delivery_address),
    nullif(trim(coalesce(p_notes,'')),''),v_total,'جديد')
  returning order_number into v_order_number;
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::integer;
    select * into v_product from public.products where id = (v_item->>'product_id')::uuid for update;
    insert into public.store_order_items(order_id,product_id,product_name,quantity,unit_price)
    values(v_order_id,v_product.id,v_product.name_ar,v_qty,v_product.price);
    update public.products set stock_quantity=stock_quantity-v_qty where id=v_product.id;
  end loop;
  return v_order_number;
end;
$function$;
revoke all on function public.place_store_order(text,text,text,text,jsonb) from public, authenticated;
grant execute on function public.place_store_order(text,text,text,text,jsonb) to anon;
revoke all on function public.track_repair(text,text) from public, authenticated;
grant execute on function public.track_repair(text,text) to anon, authenticated;
