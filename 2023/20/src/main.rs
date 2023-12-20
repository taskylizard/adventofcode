use num::Integer;
use std::collections::{HashMap, VecDeque};

fn main() {
    let file = std::fs::read_to_string("input.txt").unwrap();
    let lines = file.lines();
    let mut modules: HashMap<String, (Box<dyn Module>, Vec<String>)> = lines
        .map(|line| {
            let (name, destinations) = line.split_once(" -> ").unwrap();
            let (name, module): (&str, Box<dyn Module>) = if let Some(name) = name.strip_prefix('%')
            {
                (name, Box::<FlipFlop>::default())
            } else if let Some(name) = name.strip_prefix('&') {
                (name, Box::<NandGate>::default())
            } else {
                assert_eq!(name, "broadcaster");
                (name, Box::new(Broadcaster))
            };
            (
                name.to_string(),
                (
                    module,
                    destinations.split(", ").map(|x| x.to_string()).collect(),
                ),
            )
        })
        .collect();
    let mut destination = None;
    let io: Vec<(String, String)> = modules
        .iter()
        .flat_map(|(name, (_, destinations))| {
            destinations.iter().map(|dest| (name.clone(), dest.clone()))
        })
        .collect();
    for (from, to) in io.into_iter() {
        if to == "rx" {
            assert!(destination.is_none(), "more than one input to rx");
            destination = Some(from.to_string());
        }
        if let Some((module, _destinations)) = modules.get_mut(&to) {
            module.connect_input(from);
        }
    }
    let mut low_pulses = 0;
    let mut high_pulses = 0;
    simulate(&modules, |num_pulses, _source, _destination, pulse| {
        if num_pulses == 1001 {
            println!("Part 1: {}", low_pulses * high_pulses);
            Some(())
        } else {
            if pulse {
                high_pulses += 1;
            } else {
                low_pulses += 1;
            }
            None
        }
    });

    if let Some(destination) = destination {
        let (dest, _) = modules.get(&destination).unwrap();
        let dest_inputs = dest.get_inputs();
        let destp: Vec<u64> = dest_inputs
            .iter()
            .copied()
            .map(|parent| {
                let mut first_hit = None;
                let second_hit = simulate(&modules, |num_pulses, _source, destination, pulse| {
                    if pulse || destination != parent {
                        return None;
                    }
                    if first_hit.is_none() {
                        first_hit = Some(num_pulses);
                        return None;
                    }
                    Some(num_pulses)
                });
                let first = first_hit.unwrap();
                assert_eq!(second_hit, first * 2);
                first
            })
            .collect();
        println!("Part 2: {}", destp.into_iter().fold(1, |a, b| a.lcm(&b)));
    }
}

trait Module {
    fn boxed_clone(&self) -> Box<dyn Module>;
    fn get_inputs(&self) -> Vec<&str> {
        panic!()
    }
    fn connect_input(&mut self, _input_name: String) {}
    fn receive_pulse(&mut self, input_name: &str, input_high: bool) -> Option<bool>;
}

#[derive(Debug, Clone)]
struct Broadcaster;
impl Module for Broadcaster {
    fn receive_pulse(&mut self, _input_name: &str, input_high: bool) -> Option<bool> {
        Some(input_high)
    }
    fn boxed_clone(&self) -> Box<dyn Module> {
        Box::new(self.clone())
    }
}

#[derive(Default, Debug, Clone)]
struct FlipFlop {
    current: bool,
}

impl Module for FlipFlop {
    fn receive_pulse(&mut self, _input_name: &str, input_high: bool) -> Option<bool> {
        if !input_high {
            self.current = !self.current;
            Some(self.current)
        } else {
            None
        }
    }
    fn boxed_clone(&self) -> Box<dyn Module> {
        Box::new(self.clone())
    }
}

#[derive(Default, Debug, Clone)]
struct NandGate {
    states: HashMap<String, bool>,
}

impl Module for NandGate {
    fn receive_pulse(&mut self, input_name: &str, input_high: bool) -> Option<bool> {
        *self.states.get_mut(input_name).unwrap() = input_high;
        Some(!self.states.values().all(|x| *x))
    }
    fn connect_input(&mut self, input_name: String) {
        self.states.insert(input_name, false);
    }
    fn boxed_clone(&self) -> Box<dyn Module> {
        Box::new(self.clone())
    }
    fn get_inputs(&self) -> Vec<&str> {
        self.states.keys().map(String::as_str).collect()
    }
}

fn simulate<F: FnMut(u64, &str, &str, bool) -> Option<R>, R>(
    modules: &HashMap<String, (Box<dyn Module>, Vec<String>)>,
    mut terminate: F,
) -> R {
    let mut modules: HashMap<String, (Box<dyn Module>, Vec<String>)> = modules
        .iter()
        .map(|(k, (m, v))| (k.clone(), (m.boxed_clone(), v.clone())))
        .collect();
    let mut queue = VecDeque::with_capacity(1024);
    for num_presses in 1.. {
        queue.push_back(("".to_string(), "broadcaster".to_string(), false));
        while let Some((source, destination, pulse)) = queue.pop_front() {
            if let Some(ret) = terminate(num_presses, source.as_str(), &destination, pulse) {
                return ret;
            }
            let Some((module, destinations)) = modules.get_mut(&destination) else {
                continue;
            };
            match module.receive_pulse(source.as_str(), pulse) {
                None => (),
                Some(pulse) => {
                    let source = destination;
                    for destination in destinations.iter() {
                        queue.push_back((source.to_string(), destination.to_string(), pulse));
                    }
                }
            }
        }
    }
    unreachable!()
}
