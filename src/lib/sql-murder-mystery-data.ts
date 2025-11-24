
type TableData = {
    columns: string[];
    data: any[];
}

export const crimeData: Record<string, TableData> = {
    crime_scene_report: {
        columns: ['date', 'type', 'description', 'city'],
        data: [
            [20240115, 'murder', 'Security footage shows that there were two witnesses. The first witness lives at the last house on "Northwestern Dr". The second witness, named Annabel, lives somewhere on "Franklin Ave".', 'SQL City'],
            [20240220, 'theft', 'A valuable painting was stolen from the art gallery.', 'SQL City'],
        ]
    },
    person: {
        columns: ['id', 'name', 'license_id', 'address_number', 'address_street_name', 'ssn'],
        data: [
            [14887, 'Morty Schapiro', 418816, 118, 'Northwestern Dr', '111564949'],
            [16371, 'Annabel Miller', 202298, 103, 'Franklin Ave', '318771143'],
            [28819, 'Joe Germuska', 931251, 35, 'Northwestern Dr', '961239893'],
            [67318, 'Jeremy Bowers', 423327, 511, 'Meek Ave', '871539279'],
            [89906, 'Miranda Priestly', 188107, 18, 'Franklin Ave', '987756388'],
        ]
    },
    interview: {
        columns: ['person_id', 'transcript'],
        data: [
            [14887, 'I heard a gunshot and then saw a man run out. He had a "Get Fit Now Gym" bag. The membership number on the bag started with "48Z". Only gold members have those bags. The man got into a car with a plate that included "H42W".'],
            [16371, 'I saw the murder happen, and I recognized the killer from my gym when I was working out last week on January the 9th.'],
        ]
    },
    get_fit_now_member: {
        columns: ['id', 'person_id', 'name', 'membership_start_date', 'membership_status'],
        data: [
            ['48Z7A', 67318, 'Jeremy Bowers', 20230101, 'gold'],
            ['48Z55', 28819, 'Joe Germuska', 20230701, 'gold'],
            ['90081', 16371, 'Annabel Miller', 20230215, 'silver'],
        ]
    },
    get_fit_now_check_in: {
        columns: ['membership_id', 'check_in_date', 'check_in_time', 'check_out_time'],
        data: [
            ['48Z7A', 20240109, 1600, 1700],
            ['48Z55', 20240109, 1530, 1630],
            ['90081', 20240109, 1700, 1800],
        ]
    },
    drivers_license: {
        columns: ['id', 'age', 'height', 'eye_color', 'hair_color', 'gender', 'plate_number', 'car_make', 'car_model'],
        data: [
            [423327, 30, 67, 'brown', 'blond', 'male', '0H42W2', 'Chevrolet', 'Spark'],
            [931251, 35, 70, 'blue', 'brown', 'male', 'H42W0', 'Ford', 'Focus'],
            [202298, 28, 65, 'blue', 'brown', 'female', '8M51W7', 'Toyota', 'Corolla'],
            [188107, 35, 66, 'green', 'black', 'female', 'L3371N', 'Tesla', 'Model S']
        ]
    },
    solution: {
        columns: ['user', 'value'],
        data: [
            ['Congrats, you found the murderer!', 'Jeremy Bowers'],
        ]
    }
};
