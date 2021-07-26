web: bin/start-pgbouncer-stunnel gunicorn --chdir ed_demand_capacity_app ed_demand_capacity_app.wsgi --timeout 800
worker: python ed_demand_capacity_app/manage.py process_tasks
