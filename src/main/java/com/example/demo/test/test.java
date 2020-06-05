package com.example.demo.test;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created with IntelliJ IDEA.
 * User: duyouli
 * Date: 2020/6/3
 * Description: 描述
 * Version: V1.0
 *
 * @author 1196417540:DYL
 */
@RequestMapping("/test")
@RestController
public class test {

    @GetMapping("/hello")
    String hello() {
        return "hello";
    }
}
