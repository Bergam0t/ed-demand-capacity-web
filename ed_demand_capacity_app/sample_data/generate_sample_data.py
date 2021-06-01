import pandas as pd
from faker import Faker
from faker.providers import BaseProvider
import random

fake = Faker()


start_date = '27-02-17'
end_date = '12-05-2019'

streams = ['Resus', 'Majors', 'Minors']
stream_weights = [169, 1609, 2517]

output_filepath = ''
output_filename = 'test_data.csv'

# Create a stream chooser
# create new provider class
class StreamProvider(BaseProvider):
    def stream(self):
        return random.choices(streams,  weights = stream_weights)[0]
# then add new provider to faker instance
fake.add_provider(StreamProvider)


# Generate data
date_range = pd.date_range(start_date, end_date , freq='d')

test_data = []

for date in date_range:
    # Generate a random number of rows for the day
    n_rows_day = random.randint(50, 80)
    # If a weekend, uplift by a random amount
    if date.weekday() == 5 or date.weekday() == 6:
         n_rows_day += random.randint(10, 20)
    # If summer, uplift by a random amount
    if date.month == 7 or date.month == 8:
         n_rows_day += random.randint(10, 20)
    # If winter, uplift by a random amount
    if date.month == 1 or date.month == 2:
         n_rows_day += random.randint(10, 20)


    # Need to come back and fix the arrival time generation as it currently has
    # a different date to the date part
    day_data = {

    'date': [date for i in range(n_rows_day)],
    'stream': [fake.stream() for i in range(n_rows_day)],
    'nhs_number': [''.join(["{}".format(random.randint(0, 9)) for num in range(0, 10)]) 
                  for i in range(n_rows_day)],
    'arrival_time': [fake.time(pattern='%H:%M:%S', end_datetime=None) for i in range(n_rows_day)]

    }

    test_data.append(pd.DataFrame(day_data))

test_data_df = pd.concat(test_data).reset_index()
test_data_df['hour'] = test_data_df['arrival_time'].apply(lambda x: pd.to_datetime(x).hour)
# Correct the arrival time
test_data_df['corrected_date_time'] = (
     pd.to_datetime(test_data_df.date 
                    + ':' 
                    + test_data_df['arrival_time'].dt.time.astype('str'), 
                    format='%Y-%m-%d:%H:%M:%S')
)

test_data_df.to_csv(output_filepath + output_filename)