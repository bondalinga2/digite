const workoutData = {
    "Running": { MET: 10, types: ["time", "distance"] },
    "Cycling": { MET: 8, types: ["time", "distance"] },
    "Swimming": { MET: 7, types: ["time", "distance"] },
    "Jumping Jacks": { MET: 8, types: ["reps"] },
    "Yoga": { MET: 3, types: ["time"] },
    "Walking": { MET: 3.8, types: ["time", "distance"] }
};

const paceMETMapping = {
    "Running": [
        { minPace: 0, maxPace: 8, MET: 10 },
        { minPace: 8.1, maxPace: 10, MET: 11 },
        { minPace: 10.1, maxPace: 12, MET: 12 }
    ],
    "Cycling": [
        { minPace: 0, maxPace: 20, MET: 8 },
        { minPace: 20.1, maxPace: 25, MET: 10 },
        { minPace: 25.1, maxPace: 30, MET: 12 }
    ],
    "Swimming": [
        { minPace: 0, maxPace: 2, MET: 7 },
        { minPace: 2.1, maxPace: 3, MET: 8 },
        { minPace: 3.1, maxPace: 4, MET: 9 }
    ],
    "Walking": [
        { minPace: 0, maxPace: 5, MET: 3.8 },
        { minPace: 5.1, maxPace: 6, MET: 4.5 },
        { minPace: 6.1, maxPace: 7, MET: 5 }
    ]
};

function getAdjustedMET(workout, pace) {
    const mappings = paceMETMapping[workout];
    if (!mappings) return workoutData[workout].MET;

    for (let mapping of mappings) {
        if (pace >= mapping.minPace && pace <= mapping.maxPace) {
            return mapping.MET;
        }
    }
    return workoutData[workout].MET;
}

let totalCaloriesBurned = 0;
let workoutEntries = [];
let bodyWeight = 0;
let workoutIdCounter = 0;

function addWorkoutSection() {
    const workoutContainer = document.getElementById('workoutContainer');

    const bodyWeightInput = document.getElementById('bodyweight').value;
    if (!bodyWeightInput || bodyWeightInput <= 0) {
        alert("Please enter a valid body weight.");
        return;
    }

    bodyWeight = parseFloat(bodyWeightInput);

    const workoutSection = document.createElement('div');
    workoutSection.classList.add('workout-section');
    workoutSection.setAttribute('data-id', workoutIdCounter);

    // Workout Select
    const workoutSelect = document.createElement('select');
    for (const workout in workoutData) {
        const option = document.createElement('option');
        option.value = workout;
        option.textContent = workout;
        workoutSelect.appendChild(option);
    }

    // Input Container
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');

    // Primary Input (Duration, Distance, or Reps)
    const primaryInput = document.createElement('input');
    primaryInput.type = 'number';
    primaryInput.min = 1;
    primaryInput.classList.add('primary-input');

    // Add Set Button for Reps-Based Workouts
    const addSetBtn = document.createElement('button');
    addSetBtn.textContent = 'Add Set';
    addSetBtn.type = 'button';
    addSetBtn.style.display = 'none';
    addSetBtn.classList.add('add-set-btn');

    // Sets Container for Reps-Based Workouts
    const setsContainer = document.createElement('div');
    setsContainer.classList.add('sets-container');
    setsContainer.style.display = 'none';

    // Append primary input and add set button to input container
    inputContainer.appendChild(primaryInput);
    inputContainer.appendChild(addSetBtn);
    inputContainer.appendChild(setsContainer);

    // Distance Input (for workouts that support distance)
    const distanceInput = document.createElement('input');
    distanceInput.type = 'number';
    distanceInput.min = 0.1;
    distanceInput.placeholder = 'Distance (km)';
    distanceInput.classList.add('distance-input');
    distanceInput.style.display = 'none';
    distanceInput.style.marginLeft = '10px';

    inputContainer.appendChild(distanceInput);

    // Calories Output
    const caloriesOutput = document.createElement('span');
    caloriesOutput.textContent = 'Calories burned: 0 kcal';
    caloriesOutput.classList.add('calories-output');

    // Remove Workout Button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.type = 'button';
    removeBtn.classList.add('remove-workout-btn');

    // Append all elements to workout section
    workoutSection.appendChild(workoutSelect);
    workoutSection.appendChild(inputContainer);
    workoutSection.appendChild(caloriesOutput);
    workoutSection.appendChild(removeBtn);

    // Add workout section to container
    workoutContainer.appendChild(workoutSection);

    // Initialize workout entry
    workoutEntries.push({
        id: workoutIdCounter,
        calories: 0
    });

    const currentId = workoutIdCounter;
    workoutIdCounter++;

    // Update Input Placeholder and Visibility Based on Workout Type
    function updateInputs() {
        const selectedWorkout = workoutSelect.value;
        const types = workoutData[selectedWorkout].types;

        // Reset inputs
        primaryInput.value = '';
        distanceInput.value = '';
        caloriesOutput.textContent = 'Calories burned: 0 kcal';
        const entry = workoutEntries.find(entry => entry.id === currentId);
        if (entry) {
            totalCaloriesBurned -= entry.calories;
            entry.calories = 0;
        }
        calculateTotalCalories();

        // Determine input types
        if (types.includes("reps")) {
            primaryInput.placeholder = 'Reps';
            primaryInput.style.display = 'none';
            addSetBtn.style.display = 'inline-block';
            setsContainer.style.display = 'block';
            distanceInput.style.display = 'none';
        } else if (types.includes("time") && types.includes("distance")) {
            primaryInput.placeholder = 'Duration (mins)';
            primaryInput.style.display = 'block';
            distanceInput.placeholder = 'Distance (km)';
            distanceInput.style.display = 'block';
            addSetBtn.style.display = 'none';
            setsContainer.style.display = 'none';
        } else if (types.includes("time")) {
            primaryInput.placeholder = 'Duration (mins)';
            primaryInput.style.display = 'block';
            distanceInput.style.display = 'none';
            addSetBtn.style.display = 'none';
            setsContainer.style.display = 'none';
        } else if (types.includes("distance")) {
            primaryInput.placeholder = 'Distance (km)';
            primaryInput.style.display = 'block';
            distanceInput.style.display = 'none';
            addSetBtn.style.display = 'none';
            setsContainer.style.display = 'none';
        }
    }

    // Update Calories Based on Inputs
    function updateCalories() {
        const selectedWorkout = workoutSelect.value;
        const types = workoutData[selectedWorkout].types;
        const workoutIndex = workoutEntries.findIndex(entry => entry.id === currentId);
        let caloriesBurned = 0;

        if (types.includes("reps")) {
            const repsInputs = setsContainer.querySelectorAll('.reps-input');
            let totalReps = 0;
            repsInputs.forEach(input => {
                const val = parseFloat(input.value);
                if (val && val > 0) totalReps += val;
            });
            // Adjust the multiplier based on the specific exercise
            const repsFactor = 0.05; // Example multiplier
            caloriesBurned = workoutData[selectedWorkout].MET * bodyWeight * totalReps * repsFactor;
        } else {
            const durationValue = parseFloat(primaryInput.value);
            const distanceValue = parseFloat(distanceInput.value);

            if (types.includes("time") && types.includes("distance")) {
                if (durationValue > 0 && distanceValue > 0) {
                    const pace = distanceValue / (durationValue / 60); // km/h
                    const adjustedMET = getAdjustedMET(selectedWorkout, pace);
                    caloriesBurned = adjustedMET * bodyWeight * (durationValue / 60);
                } else if (durationValue > 0) {
                    caloriesBurned = workoutData[selectedWorkout].MET * bodyWeight * (durationValue / 60);
                } else if (distanceValue > 0) {
                    caloriesBurned = workoutData[selectedWorkout].MET * bodyWeight * distanceValue;
                }
            } else if (types.includes("time")) {
                if (durationValue > 0) {
                    caloriesBurned = workoutData[selectedWorkout].MET * bodyWeight * (durationValue / 60);
                }
            } else if (types.includes("distance")) {
                if (distanceValue > 0) {
                    caloriesBurned = workoutData[selectedWorkout].MET * bodyWeight * distanceValue;
                }
            }
        }

        // Update calories burned
        if (workoutIndex !== -1) {
            totalCaloriesBurned -= workoutEntries[workoutIndex].calories;
            workoutEntries[workoutIndex].calories = caloriesBurned;
            totalCaloriesBurned += caloriesBurned;
        }

        caloriesOutput.textContent = `Calories burned: ${caloriesBurned.toFixed(2)} kcal`;
        calculateTotalCalories();
    }

    // Remove Workout Section
    function removeWorkout() {
        const workoutIndex = workoutEntries.findIndex(entry => entry.id === currentId);
        if (workoutIndex !== -1) {
            totalCaloriesBurned -= workoutEntries[workoutIndex].calories;
            workoutEntries.splice(workoutIndex, 1);
            workoutContainer.removeChild(workoutSection);
            calculateTotalCalories();
        }
    }

    // Add Set for Reps-Based Workouts
    function addSet() {
        const setDiv = document.createElement('div');
        setDiv.classList.add('set');

        const repsInput = document.createElement('input');
        repsInput.type = 'number';
        repsInput.placeholder = 'Reps';
        repsInput.min = 1;
        repsInput.classList.add('reps-input');

        const removeSetBtn = document.createElement('button');
        removeSetBtn.textContent = 'Remove Set';
        removeSetBtn.type = 'button';
        removeSetBtn.classList.add('remove-set-btn');

        setDiv.appendChild(repsInput);
        setDiv.appendChild(removeSetBtn);
        setsContainer.appendChild(setDiv);

        repsInput.addEventListener('input', updateCalories);
        removeSetBtn.addEventListener('click', () => {
            setsContainer.removeChild(setDiv);
            updateCalories();
        });
    }

    // Event Listeners
    workoutSelect.addEventListener('change', () => {
        updateInputs();
        updateCalories();
    });
    primaryInput.addEventListener('input', updateCalories);
    distanceInput.addEventListener('input', updateCalories);
    removeBtn.addEventListener('click', removeWorkout);
    addSetBtn.addEventListener('click', addSet);

    // Initialize Inputs for Default Selection
    updateInputs();
}

function calculateTotalCalories() {
    document.getElementById('totalCalories').textContent = totalCaloriesBurned.toFixed(2);
}

document.getElementById('addWorkoutBtn').addEventListener('click', addWorkoutSection);
